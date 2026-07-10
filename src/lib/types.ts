export type Spotify = {
    track_id: string;
    timestamps: {
        start: number;
        end: number;
    };
    song: string;
    artist: string;
    album_art_url: string;
    album: string;
};

export type Activity = {
    type: number;
    name: string;
    id: string;
    details?: string;
    state?: string;
    application_id?: string;
    timestamps?: {
        start?: number;
        end?: number;
    };
    assets?: {
        large_image?: string;
        large_text?: string;
        small_image?: string;
        small_text?: string;
    };
    emoji?: {
        name: string;
        id?: string;
        animated?: boolean;
    };
};

export type TocItem = {
    level: number;
    text: string;
    id: string;
    children?: TocItem[];
};

export type PostMetadata = {
    title: string;
    slug: string;
    desc: string;
    image?: string;
    caption?: string;
    date: string;
    tags: string[];
    published: boolean;
    toc?: TocItem[];
};

export type PostLink = {
    metadata: PostMetadata;
    postPath: string;
};

export type Station = {
    id: string;
    name: string;
    mp3: string;
};

export type NightrideTrack = {
    station: string;
    title: string;
    artist: string;
    album: string;
    comment: string;
};

export type Project = {
    title: string;
    description: string;
    techStack: string[];
    links: {
        repo?: string;
        live?: string;
    };
};
