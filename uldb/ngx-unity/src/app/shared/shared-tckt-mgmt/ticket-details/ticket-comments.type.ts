interface OrganizationsItem {
    id: number;
    name: string;
}
interface UsersItem {
    organization_id: number;
    photo: string;
    id: number;
    agent: boolean;
    name: string;
}
interface CommentsItem {
    body: string;
    plain_body: string;
    attachments: AttachmentsItem[];
    url: string;
    created_at: string;
    id: number;
    request_id: number;
    author_id: number;
    type: string;
    public: boolean;
    html_body: string;
}
interface AttachmentsItem {
    thumbnails: ThumbnailsItem[];
    url: string;
    file_name: string;
    content_url: string;
    height: number;
    width: number;
    mapped_content_url: string;
    content_type: string;
    inline: boolean;
    id: number;
    size: number;
}
interface ThumbnailsItem {
    url: string;
    file_name: string;
    content_url: string;
    height: number;
    width: number;
    mapped_content_url: string;
    content_type: string;
    inline: boolean;
    id: number;
    size: number;
}
