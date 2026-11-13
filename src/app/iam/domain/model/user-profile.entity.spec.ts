import { describe, expect, it } from 'vitest';
import { getMissingNotificationChannels } from './user-profile.entity';

describe('getMissingNotificationChannels', () => {
  it('returns only channels not yet configured for the account', () => {
    const missing = getMissingNotificationChannels([
      {
        id: '1',
        accountId: 'a1',
        channel: 'EMAIL',
        enabled: true,
        priorityStart: '20:00',
        priorityEnd: '07:00',
        timeZone: 'America/Lima',
      },
      {
        id: '2',
        accountId: 'a1',
        channel: 'WHATSAPP',
        enabled: false,
        priorityStart: '20:00',
        priorityEnd: '07:00',
        timeZone: 'America/Lima',
      },
    ]);

    expect(missing).toEqual(['SMS']);
  });
});
