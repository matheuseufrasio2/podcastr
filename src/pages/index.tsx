import { GetStaticProps } from "next";
import Head from 'next/head';
import Image from 'next/image';
import { api } from "../services/api";
import {format, parseISO} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";
import styles from './home.module.scss';
import Link from 'next/link';
import { usePlayer } from "../contexts/PlayerContext";

interface Episode {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

interface HomeProps {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  const { playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          { latestEpisodes.map((episode, index) => (
            <li key={episode.id}>
              <div className={styles.thumbnailEpisode}>
                <Image
                  objectFit="cover"
                  width={192}
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                />
              </div>

              <div className={styles.episodeDetails}>
                <Link href={`/episodes/${episode.id}`}>
                  <a >{episode.title}</a>
                </Link>

                <p>{episode.members}</p>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
              </div>

              <button type="button" onClick={() => playList(episodeList, index)}>
                <img src="/play-green.svg" alt="Tocar Episodio"/>
              </button>
            </li>
          )) }
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <th></th>
            <th>Podcast</th>
            <th>Integrantes</th>
            <th>Data</th>
            <th>Duração</th>
            <th></th>
          </thead>
          <tbody>
            {allEpisodes.map((episode, index) => (
              <tr key={episode.id}>
                <td>
                  <div className={styles.imageOnTable}>
                    <Image 
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      objectFit="cover"
                      alt={episode.title}
                    />
                  </div>
                </td>
                <td>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                </td>
                <td>{episode.members}</td>
                <td style={{ width: 100 }}>{episode.publishedAt}</td>
                <td>{episode.durationAsString}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => playList(episodeList, index + latestEpisodes.length)}
                  >
                    <img src="/play-green.svg" alt="Tocar episódio"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
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

  const episodes = response.data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {
        locale: ptBR,
      }),
      duration: episode.file.duration,
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    }
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 1 // 8 horas
  }
}
