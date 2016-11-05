import express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import gitCtrl from '../controllers/git.controller';
import config from '../../config/env';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/git-get').post(gitCtrl.gitGet);

router.route('/git-blame').get(gitCtrl.gitBlame);

export default router;
