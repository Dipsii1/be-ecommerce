var express = require('express');
var router = express.Router();

/* GET all users  */
router.get('/', function (req, res) {
  try {
    const users = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ];
    return res.status(200).json({
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message || 'terjadi kesalahan saat mengambil data users',
    });
  }
});

module.exports = router;
