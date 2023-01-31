import {AppCallResponse} from '@mattermost/types/lib/apps';
import express from 'express';
import {AppBinding, AppCallRequest, AppView} from 'types';
import {makeHeaderView} from './home_header_view';

const router = express.Router();

router.post<undefined, AppCallResponse<AppView>, AppCallRequest>('/views/home', (req, res) => {
    res.json({
        type: 'ok',
        data: {
            app_id: 'hello-world-app-bar', // this shouldn't be necessary
            type: 'view',
            location: 'rhs',
            bindings: [
                makeHeaderView(),
                makeInitialDocumentListView(),
            ],
        },
    });
});

router.post<undefined, AppCallResponse<AppView>, AppCallRequest>('/views/home/refresh/document-list', (req, res) => {
    res.json({
        type: 'view',
        data: {
            type: 'view',
            location: 'document-list',
            bindings: [
                makePopulatedDocumentListView(req.body),
            ],
        },
    });
});

const makeInitialDocumentListView = (): AppView => {
    return {
        type: 'view',
        location: 'document-list',
        source: {
            path: '/views/home/refresh/document-list',
            expand: {
                channel: 'summary',
            },
            state: {
                drive_id: 'my_drive',
            } as DriveSelectionState,
        },
    };
};

const makePopulatedDocumentListView = (call: AppCallRequest): AppView => {
    const view = makeInitialDocumentListView();

    const state: DriveSelectionState | undefined = call.state;
    if (!state || !state.drive_id) {
        return view;
    }

    const driveID = state.drive_id;
    view.source!.state = {
        drive_id: driveID,
    }

    const channel = call.context?.channel;
    const channelName = channel?.name || 'No channel provided';

    const documentList = makeDocumentList(driveID, channelName);
    const documentViews = documentList.map(makeDocumentItemBinding);

    view.bindings = [
        {
            type: 'list_block',
            location: 'document_list_block',
            bindings: documentViews,
        },
    ];

    return view;
};

export type DriveDocument = {
    id: string;
    label: string;
};

export type DriveSelectionState = {
    drive_id: DriveID;
}

export type DocumentSubmitState = {
    document_id: string;
}

export type DriveID = 'my_drive' | 'shared_with_me';

const makeDocumentList = (driveID: DriveID, channelName: string): DriveDocument[] => {
    if (driveID === 'my_drive') {
        return [
            {
				id:    'my_doc_1',
				label: 'My Document - ' + channelName,
			},
			{
				id:    'my_doc_2',
				label: 'My Second Document',
			},
        ]
    }

    return [
        {
            id:    'shared_doc_1',
            label: 'My Shared Document - ' + channelName,
        },
        {
            id:    'shared_doc_2',
            label: 'My Second Shared Document',
        },
    ];
};

const makeDocumentItemBinding = (document: DriveDocument): AppView => {
    const view: AppView = {
        type: 'list_item',
        location: document.id,
        label: document.label,
        description: '4:30 PM · Opened by me',
        icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
        submit: {
            path: '/actions/open-file',
            state: {
                document_id: document.id,
            } as DocumentSubmitState,
        },
    };

    const openAction: AppView = {
        type: 'action',
        label: 'Open',
        icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
        submit: {
            path: '/actions/open-file',
            state: {
                document_id: document.id,
            } as DocumentSubmitState,
        },
    };

    const shareAction: AppView = {
        type: 'action',
        label: 'Share',
        icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
        submit: {
            path: '/actions/share-file',
            state: {
                document_id: document.id,
            } as DocumentSubmitState,
        },
    };

    const deleteAction: AppView = {
        type: '',
        label: 'Delete',
        icon: 'https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw',
        form: {
            title: 'Confirm File Delete',
            submit: {
                path: '/actions/delete-file',
                state: {
                    document_id: document.id,
                } as DocumentSubmitState,
            },
            fields: [
                {
                    name: 'markdown',
                    type: 'markdown',
                    description: 'File ' + document.label,
                },
                {
                    name: 'submit_buttons',
                    type: 'static_select',
                    options: [
                        {
                            label: 'Confirm',
                            value: 'confirm',
                        },
                    ],
                },
            ],
            submit_buttons: 'submit_buttons',
        },
    };

    const actions: AppView[] = [
        openAction,
        shareAction,
        deleteAction,
    ];

    view.bindings = [
        {
            type: 'actions',
            location: 'actions',
            bindings: actions,
        },
    ];

    return view;
}

const rhsViewsRouter = router;
export default rhsViewsRouter;
