import express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import gitCtrl from '../controllers/git.controller';
import config from '../../config/env';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/git-help').post(gitCtrl.gitHelper);

router.route('/git-get').get(gitCtrl.gitGet);

export default router;
