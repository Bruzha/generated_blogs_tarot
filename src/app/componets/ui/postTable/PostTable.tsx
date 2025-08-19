'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import "./style.scss";

export interface PostType {
    _id: string;
    title: string;
    slug: {
        current: string;
    };
    publishedAt: string;
    image?: string | null;
    body: string;
    bodyContent?: string;
    status: string;
}

interface PostTableProps {
  posts: PostType[];
  onPostUpdate: (postId: string, newStatus: PostType['status']) => void;
}

export default function PostTable({ posts, onPostUpdate }: PostTableProps) {
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

  return (
    <>
      <button className="blueButton" onClick={handleSelectAll}>
        Select all
      </button>
      <table className="table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Status</th>
            <th>Date</th>
            <th>Title</th>
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
              <td className="status">{post.status}</td>
              <td>{format(new Date(post.publishedAt), 'dd.MM.yyyy')}</td>
              <td className="link">
                <Link href={`/article/${post.slug.current}`} className="blueLink">
                  {post.title}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}