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
  | 'publishing'
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
    default:
      return 'Loading articles from Sanity...';
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
