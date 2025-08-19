// Переопределение типов, чтобы устранить ошибку с Promise в params

declare module '.next/types/app/article/[slug]/page' {
  export interface PageProps {
    params: {
      slug: string;
    };
  }
}
