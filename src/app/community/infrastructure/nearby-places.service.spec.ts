import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { CRS, latLng } from 'leaflet';
import { PbfWriter } from 'pbf';
import { afterEach, describe, expect, it } from 'vitest';
import { decodePoiVectorTile, NearbyPlacesService } from './nearby-places.service';

if (!getTestBed().platform) {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

function buildMockPoiMvtTile(
  features: Array<{ tags: Record<string, string>; px: number; py: number }>,
): ArrayBuffer {
  const keys: string[] = [];
  const values: string[] = [];
  const keyIndex = (k: string): number => {
    let idx = keys.indexOf(k);
    if (idx === -1) {
      idx = keys.length;
      keys.push(k);
    }
    return idx;
  };
  const valIndex = (v: string): number => {
    let idx = values.indexOf(v);
    if (idx === -1) {
      idx = values.length;
      values.push(v);
    }
    return idx;
  };

  const encodedFeatures = features.map((feat) => {
    const tagPairs: number[] = [];
    for (const [k, v] of Object.entries(feat.tags)) {
      tagPairs.push(keyIndex(k), valIndex(v));
    }
    const zz = (n: number) => (n << 1) ^ (n >> 31);
    const fw = new PbfWriter();
    fw.writePackedVarint(2, tagPairs);
    fw.writeVarintField(3, 1); // POINT
    fw.writePackedVarint(4, [9, zz(feat.px), zz(feat.py)]);
    return fw.finish();
  });

  const lw = new PbfWriter();
  lw.writeVarintField(15, 2); // version
  lw.writeStringField(1, 'poi');
  for (const rawFeat of encodedFeatures) {
    lw.writeBytesField(2, rawFeat);
  }
  for (const k of keys) {
    lw.writeStringField(3, k);
  }
  for (const v of values) {
    const vw = new PbfWriter();
    vw.writeStringField(1, v);
    lw.writeBytesField(4, vw.finish());
  }
  lw.writeVarintField(5, 4096); // extent

  const tw = new PbfWriter();
  tw.writeBytesField(3, lw.finish());
  const bytes = tw.finish();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe('NearbyPlacesService & MVT decoding', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('decodes OpenFreeMap poi vector tiles filtering allowed categories and sorting by distance', () => {
    const center = latLng(-12.0464, -77.0428);
    const tilePoint = CRS.EPSG3857.latLngToPoint(center, 14).divideBy(256).floor();

    const buffer = buildMockPoiMvtTile([
      {
        tags: { subclass: 'fuel', name: 'Grifo Primax', opening_hours: '24/7' },
        px: 2200,
        py: 2200,
      },
      {
        tags: { subclass: 'pharmacy', name: 'Inkafarma Centro', opening_hours: '24/7' },
        px: 2048,
        py: 2048,
      },
      {
        tags: { subclass: 'cafe', name: 'Cafeteria Ignorada' },
        px: 2050,
        py: 2050,
      },
    ]);

    const places = decodePoiVectorTile(buffer, tilePoint.x, tilePoint.y, center);
    expect(places).toHaveLength(2);
    expect(places.some((p) => p.name === 'Cafeteria Ignorada')).toBe(false);

    const pharmacy = places.find((p) => p.category === 'pharmacy');
    expect(pharmacy?.name).toBe('Inkafarma Centro');
    expect(pharmacy?.openAllDay).toBe(true);
    expect(pharmacy?.distance).toBeLessThan(3000);
  });

  it('fetches OpenFreeMap tilejson, requests covering z14 tiles, and tolerates individual tile errors', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const service = TestBed.inject(NearbyPlacesService);
    const httpMock = TestBed.inject(HttpTestingController);
    const center = latLng(-12.0464, -77.0428);
    const centerTile = CRS.EPSG3857.latLngToPoint(center, 14).divideBy(256).floor();

    const mvtBuffer = buildMockPoiMvtTile([
      {
        tags: { subclass: 'supermarket', name: 'Metro Cercado' },
        px: 2048,
        py: 2048,
      },
    ]);

    let loaded: unknown[] | undefined;
    service.load(center).subscribe((res) => {
      loaded = res;
    });

    httpMock
      .expectOne('https://tiles.openfreemap.org/planet')
      .flush({ tiles: ['https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf'] });

    const tileRequests = httpMock.match((req) =>
      req.url.startsWith('https://tiles.openfreemap.org/planet/14/'),
    );
    expect(tileRequests.length).toBeGreaterThanOrEqual(4);

    tileRequests.forEach((req, idx) => {
      if (req.request.url.endsWith(`/14/${centerTile.x}/${centerTile.y}.pbf`)) {
        req.flush(mvtBuffer);
      } else if (idx === 0) {
        req.flush(new ArrayBuffer(0), { status: 404, statusText: 'Not Found' });
      } else {
        req.flush(new ArrayBuffer(0));
      }
    });

    expect(loaded).toBeDefined();
    expect(loaded?.length).toBe(1);
    expect((loaded?.[0] as { name: string }).name).toBe('Metro Cercado');
  });
});
