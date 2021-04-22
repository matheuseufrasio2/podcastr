import { GetStaticProps } from "next";
import { api } from "../services/api";

interface Episode {
  id: string;
  title: string;
  members: string;
  // published_at: string;
  // thumbnail: string;
  // description: string;
  // file: {
  //   url: string;
  //   type: string;
  //   duration: number;
  // }
}

interface HomeProps {
  episodes: Episode[];
}

export default function Home({ episodes }: HomeProps) {
  return (
    <div>
      <h1>Index</h1>
      <p>{JSON.stringify(episodes[0])}</p>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  return {
    props: {
      episodes: response.data
    },
    revalidate: 60 * 60 * 8 // 8 horas
  }
}
