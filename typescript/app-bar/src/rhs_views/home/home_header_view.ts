import {AppCallResponse} from '@mattermost/types/lib/apps';
import express from 'express';
import {AppCallRequest, AppView} from 'types';

const router = express.Router();

export const makeHeaderView = (): AppView => {
    return {
        type: 'layout',
        subtype: 'horizontal',
        location: 'header',
        bindings: [
            {
                location: '',
                bindings: [
                    {
                        type: 'option',
                        location: 'my_drive',
                        label: 'My Drive',
                        selected: true,
                        submit: {
                            expand: {
                                channel: 'summary'
                            },
                            path: '/views/home/refresh/document-list',
                            state: {
                                drive_id: 'my_drive'
                            }
                        }
                    },
                    {
                        type: 'option',
                        location: 'shared_with_me',
                        label: 'Shared With Me',
                        submit: {
                            expand: {
                                channel: 'summary'
                            },
                            path: '/views/home/refresh/document-list',
                            state: {
                                drive_id: 'shared_with_me'
                            }
                        }
                    }
                ],
                subtype: 'categories',
                type: 'select'
            },
            {
                label: '+ New',
                subtype: 'button',
                type: 'select',
                bindings: [
                    {
                        type: 'list_item',
                        location: 'new_folder',
                        icon: 'https://imgs.search.brave.com/Ag7fXBLnY7FpZznBJ78SDwCoPDgbJBm2R0Y1WcFnVP4/rs:fit:1200:1200:1/g:ce/aHR0cHM6Ly9waXhs/b2suY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy8yMDIxLzA0L0dv/b2dsZV9Ecml2ZV9p/Y29uLmpwZw',
                        label: 'Folder',
                        submit: {
                            expand: {
                                channel: 'summary'
                            },
                            path: '/views/home/refresh/document-list',
                            state: {
                                drive_id: 'my_drive'
                            }
                        }
                    },
                    {
                        type: 'list_item',
                        location: 'new_document',
                        icon: 'https://imgs.search.brave.com/Ag7fXBLnY7FpZznBJ78SDwCoPDgbJBm2R0Y1WcFnVP4/rs:fit:1200:1200:1/g:ce/aHR0cHM6Ly9waXhs/b2suY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy8yMDIxLzA0L0dv/b2dsZV9Ecml2ZV9p/Y29uLmpwZw',
                        label: 'Docs',
                        submit: {
                            expand: {
                                channel: 'summary'
                            },
                            path: '/views/home/refresh/document-list',
                            state: {
                                drive_id: 'shared_with_me'
                            }
                        }
                    }
                ],
            },
        ],
    }
};
