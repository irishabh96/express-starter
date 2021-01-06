import { Router } from 'express';

import { ListColl } from './collection';

const controller = (() => {
  const router = Router();

  /**
   * @name list - get a list
   * @param {string} [_id] - get a item by ID in list
   * @param {string} [text] - search a text in list
   * @return {Object<{ data: ListColl[], message: string }>}
   *
   * @example GET /crud-operations
   * @example GET /crud-operations?_id=${_id}
   * @example GET /crud-operations?text=${text}
   */
  router.get('/', async (req, res) => {
    const { _id, text } = req.query;

    const find = {};

    if (_id) find._id = _id;
    if (text) find.text = { $regex: text, $options: 'i' };

    const data = await ListColl.find(find).exec();

    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @name item
   * @param {string} id - get a item by ID from params in list
   * @return {Object<{ data: ListColl[], message: string }>}
   *
   * @example GET /crud-operations/item/${id}
   */
  router.get('/item/:id', async (req, res) => {
    const data = await ListColl.find({ _id: req.params.id }).exec();
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @name count - get a list length
   * @return {Object<{ data: number, message: string }>}
   *
   * @example GET /crud-operations/count
   */
  router.get('/count', async (req, res) => {
    const data = await ListColl.count().exec();
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @name pagination - get a list of paging
   * @param {number} [page=1] - current page number
   * @param {number} [row=5] - rows per page
   * @return {Object<{ data: ListColl[], message: string }>}
   *
   * @example GET /crud-operations/pagination?page=${page}&row=${row}
   */
  router.get('/pagination', async (req, res) => {
    const data = [];

    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const count = await ListColl.count().exec();

    for (let i = 0, l = count; i < l / row; i += 1) {
      if (page === i + 1) {
        data.push(
          ListColl.find({})
            .skip(i * row)
            .limit(row),
        );
      }
    }

    res.json({
      data: [...(await Promise.all(data))],
      total: count,
      message: 'Data obtained.',
    });
  });

  /**
   * @name create - create a item
   * @return {Object<{ message: string }>}
   *
   * @example POST /crud-operations { text: ${text} }
   */
  router.post('/', async (req, res) => {
    if (!req.body.text) {
      res.status(400).json({ message: 'Please pass text.' });
    }

    const list = await new ListColl(req.body);
    const message = await list.save().then(() => 'List saved');

    res.json({ message });
  });

  /**
   * @name update - update a item
   * @return {Object<{ message: string }>}
   *
   * @example PUT /crud-operations/${id}
   */
  router.put('/:id', async (req, res) => {
    const message = await ListColl.findOneAndUpdate({ _id: req.params.id }, req.body).then(
      () => 'List updated',
    );

    res.json({ message });
  });

  /**
   * @name delete - remove a item
   * @return {Object<{ message: string }>}
   *
   * @example DELETE /crud-operations/${id}
   */
  router.delete('/:id', async (req, res) => {
    const message = await ListColl.findByIdAndRemove(req.params.id).then(() => 'List deleted');

    res.json({ message });
  });

  /**
   * @name delete-multiple - remove selected items
   * @return {Object<{ message: string }>}
   *
   * @example DELETE /crud-operations { selected: [${id}, ${id}, ${id}...] }
   */
  router.delete('/', async (req, res) => {
    const { selected } = req.body;

    const message = await ListColl.remove({ _id: { $in: selected } }).then(() => 'List deleted');

    res.json({ message });
  });

  // ------------------------- Separate line -------------------------

  /**
   * @name list - get a list
   * @param {string} [id] - get a item by ID
   * @param {string} [text] - search for text in list
   * @return {Object<{ data: ListTable[] }>}
   *
   * @example GET /crud-operations/relational
   * @example GET /crud-operations/relational?id=${id}
   * @example GET /crud-operations/relational?text=${text}
   */
  router.get('/relational', async (req, res) => {
    const { id, text } = req.query;

    const find = {};

    if (id) find.where = { ...find.where, id: [id] };
    if (text) find.where = { ...find.where, text: { [Op.like]: `%${text}%` } };

    const data = await ListTable.findAll(find);
    res.json({ data });
  });

  /**
   * @name item - get a item
   * @param {string} id - get a item by ID
   * @return {Object<{ data: ListTable[], message: string }>}
   *
   * @example GET /crud-operations/relational/item/${id}
   */
  router.get('/relational/item/:id', async (req, res) => {
    const data = await ListTable.findOne({ where: { id: [req.params.id] } });
    res.json({ data: [data], message: 'Data obtained.' });
  });

  /**
   * @name count - get a list length
   * @return {Object<{ data: number, message: string }>}
   *
   * @example GET /crud-operations/relational/count
   */
  router.get('/relational/count', async (req, res) => {
    const data = await ListTable.count();
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @name pagination - get a list of paging
   * @return {Object<{ data: ListColl[], message: string }>}
   *
   * @example GET /crud-operations/relational/pagination?page=${page}&row=${row}
   */
  router.get('/relational/pagination', async (req, res) => {
    // TODO: pagination
    // const page = Number(req.query.page) || 1;
    // const row = Number(req.query.row) || 5;

    const data = await ListTable.findAndCountAll({ offset: 0, limit: 5 });
    res.json({ data });
  });

  /**
   * @name create - create a item
   * @return {Object<{ message: string }>}
   *
   * @example POST /crud-operations/relational { text: ${text} }
   */
  router.post('/relational', async (req, res) => {
    const message = await ListTable.create(req.body).then(() => 'List saved');

    res.json({ message });
  });

  /**
   * @name update - update a item
   */
  router.put('/relational/:id', async (req, res) => {
    const message = await ListTable.update(
      // TODO: update
      { updatedAt: req.body },
      { where: { id: req.params.id } },
    ).then(() => 'List saved');

    res.json({ message });
  });

  /**
   * @name delete - remove a item
   * @return {Object<{ message: string }>}
   *
   * @example DELETE /crud-operations/relational/${id}
   */
  router.delete('/relational/:id', async (req, res) => {
    const message = await ListTable.destroy({ where: { id: req.params.id } }).then(
      () => 'List deleted',
    );

    res.json({ message });
  });

  /**
   * @name delete-multiple - remove selected items
   * @return {Object<{ message: string }>}
   *
   * @example DELETE /crud-operations/relational { selected: [${id}, ${id}, ${id}...] }
   */
  router.delete('/relational', async (req, res) => {
    // TODO: delete many
    // const { selected } = req.body;

    res.json({ message: '' });
  });

  return router;
})();

controller.prefix = '/crud-operations';

export default controller;
