import express from 'express';

import {AppCallResponse} from '@mattermost/types/lib/apps';

import {AppCallRequest} from 'types';
import {DocumentSubmitState} from 'rhs_views/home/document_list_view';

const router = express.Router();

router.post<undefined, AppCallResponse, AppCallRequest>('/open-file', async (req, res) => {
    const state: DocumentSubmitState = req.body.state;

    const message = `Opening document ${state.document_id}`;

    res.json({
        type: 'ok',
        text: message,
    });
});

router.post<undefined, AppCallResponse, AppCallRequest>('/share-file', async (req, res) => {
    const state: DocumentSubmitState = req.body.state;

    const message = `Sharing document ${state.document_id}`;

    res.json({
        type: 'ok',
        text: message,
    });
});

router.post<undefined, AppCallResponse, AppCallRequest>('/delete-file', async (req, res) => {
    const state: DocumentSubmitState = req.body.state;

    const message = `Deleting document ${state.document_id}`;

    res.json({
        type: 'ok',
        text: message,
    });
});

const actionsRouter = router;
export default actionsRouter;
