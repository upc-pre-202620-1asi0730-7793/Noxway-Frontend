import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CommunityPost, CommunityLeader } from '../../../domain/model/community-post.entity';
import { CommunityService } from '../../../infrastructure/community.service';

@Component({
  selector: 'app-community',
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatChipsModule],
  templateUrl: './community.html',
  styleUrl: './community.css',
})
export class Community implements OnInit {
  private readonly communityService = inject(CommunityService);

  readonly posts = signal<CommunityPost[]>([]);
  readonly leaders = signal<CommunityLeader[]>([]);
  readonly selectedDistrict = signal<string>('all');

  ngOnInit(): void {
    this.communityService.getCommunityPosts().subscribe((posts) => {
      this.posts.set(posts);
    });

    this.communityService.getLeaders().subscribe((leaders) => {
      this.leaders.set(leaders);
    });
  }

  setDistrict(district: string): void {
    this.selectedDistrict.set(district);
  }

  filteredPosts(): CommunityPost[] {
    const filter = this.selectedDistrict();
    if (filter === 'all') return this.posts();
    return this.posts().filter((p) => p.district === filter);
  }

  toggleVote(post: CommunityPost): void {
    const updated = this.posts().map((p) => {
      if (p.id === post.id) {
        return {
          ...p,
          upvotes: p.upvotes + 1,
        };
      }
      return p;
    });
    this.posts.set(updated);
  }

  onPublishNotice(): void {
    const title = prompt('Título del aviso comunitario:');
    if (!title) return;
    const desc = prompt('Detalle del reporte o aviso nocturno:');
    if (!desc) return;

    const newPost: CommunityPost = {
      id: Date.now(),
      authorName: 'Jorge Luis Huamán',
      authorRole: 'Vigilante Nocturno',
      avatar: 'JL',
      timeAgo: 'Hace un momento',
      location: 'Lima Norte',
      badge: 'Reporte Reciente',
      badgeType: 'verified',
      district: 'los-olivos',
      title: title,
      content: desc,
      upvotes: 1,
      actionLabel: 'Es verídico',
    };

    this.posts.set([newPost, ...this.posts()]);
    alert('Aviso publicado con éxito en la red comunitaria de Noxway.');
  }
}
