import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DreamCardProps {
  dream: {
    id: string;
    title: string;
    dream: string;
    created: string;
    user?: string;
  };
}

export function DreamCard({ dream }: DreamCardProps) {
  const formattedDate = formatDistanceToNow(new Date(dream.created), {
    addSuffix: true,
  });
  
  const author = dream.user || 'Anonymous';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dream.title}</CardTitle>
        <CardDescription>
          Dreamed by {author} • {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap">{dream.dream}</div>
      </CardContent>
    </Card>
  );
}
