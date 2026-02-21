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

export type DiscordUser = {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    global_name: string;
    display_name: string;
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

export interface DiscordPresence {
    kv: object;
    spotify: Spotify | null;
    discord_user: DiscordUser;
    activities: Activity[];
    discord_status: "online" | "idle" | "dnd" | "offline";
    active_on_discord_web: boolean;
    active_on_discord_desktop: boolean;
    active_on_discord_mobile: boolean;
    listening_to_spotify: boolean;
}

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

export interface Project {
    title: string;
    description: string;
    techStack: string[];
    links: {
        repo?: string;
        live?: string;
    };
    image?: string;
}
