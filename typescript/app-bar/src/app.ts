// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import express from 'express';

// Shim for mattermost-redux global fetch access
global.fetch = require('node-fetch');

import {AppBinding, AppCallRequest, AppCallResponse, AppForm, AppManifest, Locations, Permission} from './types';
import {Post} from '@mattermost/types/lib/posts';
import {Channel} from '@mattermost/types/lib/channels';

import {Client4} from '@mattermost/client';
import rhsViewsRouter from './rhs_views/home/document_list_view';
import {DRIVE_ICON_URL} from './constants';

const host = process.env.APP_HOST || 'localhost';
const port = process.env.APP_PORT || 4000;

const app = express();
app.use(express.json());

// Uncomment these lines to enable verbose debugging of requests and responses
import logger from './middleware/logger';
import actionsRouter from './actions';
app.use(logger);

app.use((req, res, next) => {
    const call: AppCallRequest = req.body;

    // This is used to interact with the Mattermost server in the docker-compose dev environment.
    // We ignore the site URL sent in call requests, and instead use the known site URL from the environment variable.
    if (call?.context?.mattermost_site_url && process.env.MATTERMOST_SITEURL) {
        call.context.mattermost_site_url = process.env.MATTERMOST_SITEURL;
    }

    next();
});

const manifest: AppManifest = {
    app_id: 'hello-world-app-bar',
    display_name: "Hello World",
    description: "Example TypeScript app for Mattermost",
    homepage_url: 'https://github.com/mattermost/mattermost-app-examples/typescript/hello-world',
    icon: 'icon.png',
    requested_permissions: [
        Permission.ActAsBot,
    ],
    requested_locations: [
        Locations.ChannelHeader,
        Locations.Command,
    ],
    http: {
        root_url: `http://${host}:${port}`,
    },
};

const form: AppForm = {
    title: "I'm a form!",
    icon: 'icon.png',
    fields: [
        {
            type: 'text',
            name: 'message',
            label: 'message',
            position: 1,
        },
    ],
    submit: {
        path: '/submit',
        expand: {
            acting_user: 'summary',
        },
    },
};

const channelHeaderBindings: AppBinding = {
    location: '/channel_header',
    bindings: [
        {
            location: 'send-button',
            icon: DRIVE_ICON_URL,
            label: 'send hello message',
            // form,
            submit: {
                path: '/views/home',
            },
        },
    ],
};

const commandBindings: AppBinding = {
    location: '/command',
    bindings: [
        {
            icon: 'icon.png',
            label: 'hello-world-app-bar',
            description: manifest.description,
            hint: '[send]',
            bindings: [
                {
                    location: 'send',
                    label: 'send',
                    form,
                },
            ],
        },
    ],
};

// Serve resources from the static folder
app.use('/static', express.static('./static'));

app.get<undefined, AppManifest>('/manifest.json', (req, res) => {
    res.json(manifest);
});

app.post<undefined, AppCallResponse<AppBinding[]>, AppCallRequest>('/bindings', (req, res) => {
    const callResponse: AppCallResponse<AppBinding[]> = {
        type: 'ok',
        data: [
            channelHeaderBindings,
            // commandBindings,
        ],
    };

    res.json(callResponse);
});

type FormValues = {
    message: string;
}

app.post<undefined, AppCallResponse, AppCallRequest>('/submit', async (req, res) => {
    const call = req.body;

    const actingUser = call.context.acting_user;
    if (!actingUser) {
        res.json({type: 'error', text: 'acting_user not provided'});
        return;
    }

    const botClient = new Client4();
    botClient.setUrl(call.context.mattermost_site_url);
    botClient.setToken(call.context.bot_access_token);

    const formValues = call.values as FormValues;

    let message = 'Hello, world!';
    const submittedMessage = formValues.message;
    if (submittedMessage) {
        message += ' ...and ' + submittedMessage + '!';
    }

    const users = [
        call.context.bot_user_id,
        actingUser.id,
    ] as string[];

    let channel: Channel;
    try {
        channel = await botClient.createDirectChannel(users);
    } catch (e: any) {
        res.json({
            type: 'error',
            text: 'Failed to create/fetch DM channel: ' + e.message,
        });
        return;
    }

    const post = {
        channel_id: channel.id,
        message,
    } as Post;

    try {
        await botClient.createPost(post)
    } catch (e: any) {
        res.json({
            type: 'error',
            text: 'Failed to create post in DM channel: ' + e.message,
        });
        return;
    }

    const callResponse: AppCallResponse = {
        type: 'ok',
        text: 'Created a post in your DM channel.',
    };

    res.json(callResponse);
});

app.use(rhsViewsRouter);
app.use('/actions', actionsRouter);

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
