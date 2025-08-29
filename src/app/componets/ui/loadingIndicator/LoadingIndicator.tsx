'use client';

import React from 'react';
import './style.scss';

type LoadingStage =
  | 'initial'
  | 'initial-article'
  | 'content-plan'
  | 'article-generation'
  | 'status-update'
  | 'image-generation'
  | 'deleting'
  | 'publishing'
  | 'create-other-version'
  | 'done';

interface LoadingIndicatorProps {
  stage: LoadingStage;
}

const getMessage = (
  stage: LoadingStage
) => {
  switch (stage) {
    case 'content-plan':
      return 'Generating content plan...';
    case 'article-generation':
      return `Generating articles...`;
    case 'image-generation':
      return 'Generating images...';
    case 'publishing':
      return 'Publishing articles...';
    case 'done':
      return 'Generation complete!';
    case 'status-update':
      return `Saving changes in Sanity...`;
    case 'initial-article':
      return `Loading article from Sanity...`;
    case 'deleting':
      return `Removing article/s from Sanity...`;
    case 'create-other-version':
      return `Translation of the article into Russian and Ukrainian...`;
    default:
      return 'Loading article/s from Sanity...';
  }
};

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  stage,
}) => {
  return (
    <div className="loadingIndicator">
      <div className="loadingIndicator__spinner" />
      <p className="loadingIndicator__text">
        {getMessage(stage)}
      </p>
    </div>
  );
};

export default LoadingIndicator;
export type { LoadingStage };
