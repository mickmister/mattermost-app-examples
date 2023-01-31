export {
    AppCallResponse,
    AppForm,
} from '@mattermost/types/lib/apps';

import {
    AppCallRequest as ExternalAppCallRequest,
    AppContext as ExternalAppContext,
    AppBinding as ExternalAppBinding,
    AppCall,
    AppManifest as ExternalAppManifest,
} from '@mattermost/types/lib/apps';

import {Channel} from '@mattermost/types/lib/channels';
import {UserProfile} from '@mattermost/types/lib/users';

export type AppContext = {
    mattermost_site_url: string;
    bot_access_token: string;
    bot_user_id: string;
    acting_user?: UserProfile;
    channel?: Channel;
} & ExternalAppContext;

export type AppCallRequest = {
    context: AppContext;
} & ExternalAppCallRequest;

export type AppBinding = {
    bindings?: AppBinding[];
    source?: AppCall;
} & Omit<Omit<Omit<Omit<ExternalAppBinding, 'app_id'>, 'bindings'>, 'label'>, 'location'> & (
    {label: string} | {location: string}
)

export type AppView = {
    app_id?: string;
    bindings?: AppView[];
    type: string;
    subtype?: string;
    selected?: boolean;
} & Omit<AppBinding, 'bindings'> & (
    {label: string} | {location: string}
)

export type AppManifest = {
    http: {
        root_url: string;
    };
} & ExternalAppManifest;

export enum Permission {
    ActAsBot = 'act_as_bot',
}

export enum Locations {
    ChannelHeader = '/channel_header',
    Command = '/command',
}
