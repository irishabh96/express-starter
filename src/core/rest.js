import { Router } from 'express';

import crudOperations from '~/crud-operations';

const router = Router();

router.get('/', (req, res) => {
  res.send(`app-root, ${INDEX_NAME} mode`);
});

router.use(crudOperations.prefix, crudOperations);

export default router;
