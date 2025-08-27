'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import "./style.scss";
import { PortableTextBlock } from '@portabletext/types';

export interface PostType {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  date: string;
  image?: string | null;
  content?:  PortableTextBlock[];
  bodyContent?: string;
  status?: string;
}

interface PostTableProps {
  posts: PostType[];
  onPostUpdate: (postId: string, newStatus: PostType['status']) => void;
  onDeletePosts: (postIds: string[]) => void;
}

export default function PostTable({ posts, onPostUpdate, onDeletePosts }: PostTableProps) {
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);

  const handleSelectAll = () => {
    const selectablePosts = posts.filter(post => post.status !== 'Published');
    const allSelected = selectablePosts.every(post => post.status === 'Planned for publication');

    const newStatus: PostType['status'] = allSelected ? 'Unpublished' : 'Planned for publication';

    selectablePosts.forEach(post => {
      onPostUpdate(post._id, newStatus);
    });
  };

  const handleCheckboxChange = (post: PostType) => {
    if (post.status === 'Published') return;

    const newStatus: PostType['status'] =
      post.status === 'Planned for publication' ? 'Unpublished' : 'Planned for publication';

    onPostUpdate(post._id, newStatus);
  };

  const handleDeleteCheckboxChange = (postId: string) => {
    setSelectedForDeletion(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedForDeletion.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedForDeletion.length} post(s)?`)) {
      onDeletePosts(selectedForDeletion);
      setSelectedForDeletion([]);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="blueButton" onClick={handleSelectAll}>
          Select all
        </button>
        <button className="blueButton" onClick={handleDeleteSelected}>
          Delete selected
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Status Select</th>
            <th>Date</th>
            <th>Title</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post._id}>
              <td>
                <input
                  type="checkbox"
                  disabled={post.status === 'Published'}
                  checked={post.status === 'Planned for publication'}
                  onChange={() => handleCheckboxChange(post)}
                />
              </td>
              <td> {post.date ? format(new Date(post.date), 'dd.MM.yyyy') : '—'}</td>
              <td className="link">
                <Link href={`/article/${post.slug.current}`} className="blueLink">
                  {post.title}
                </Link>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={selectedForDeletion.includes(post._id)}
                  onChange={() => handleDeleteCheckboxChange(post._id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
