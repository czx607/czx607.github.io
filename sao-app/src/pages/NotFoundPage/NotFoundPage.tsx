import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="mb-4 text-6xl font-bold">404</h1>
      <p className="mb-8 text-lg text-muted-foreground">页面不存在</p>
      <Link to="/" className="text-primary hover:underline">
        返回首页
      </Link>
    </div>
  );
}
