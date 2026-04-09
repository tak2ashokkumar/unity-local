import unittest
from app.common.utils import StorageUnitConverter


class TestStorageUnitConverter(unittest.TestCase):

    def test_bytes_to_max_unit(self):
        converter = StorageUnitConverter.bytes_to_max_unit
        self.assertEqual(converter(10995116277760), (10, 'TB'))
        self.assertEqual(converter(7704782307328), (7.01, 'TB'))
        self.assertEqual(converter(3290396884992), (2.99, 'TB'))
        self.assertEqual(converter(24189255811072), (22, 'TB'))
        self.assertEqual(converter(13655132340224), (12.42, 'TB'))
        self.assertEqual(converter(10534123470848), (9.58, 'TB'))
        self.assertEqual(converter(16106127360), (15, 'GB'))
        self.assertEqual(converter(214748364800), (200, 'GB'))
        self.assertEqual(converter(751619276800), (700, 'GB'))
        self.assertEqual(converter(9843216384), (9.17, 'GB'))
        self.assertEqual(converter(989417472), (943.58, 'MB'))
        self.assertEqual(converter(32768), (32, 'KB'))
        self.assertEqual(converter(0), (0, 'B'))
        self.assertEqual(converter(1), (1, 'B'))
        self.assertEqual(converter(1024), (1, 'KB'))
        self.assertEqual(converter(1024 * 1024), (1, 'MB'))
        self.assertEqual(converter(1024 * 1024 * 1024), (1, 'GB'))
        self.assertEqual(converter(1024 * 1024 * 1024 * 1024), (1, 'TB'))
        self.assertEqual(converter(1024 * 1024 * 1024 * 1024 * 1024), None)

    def test_convert(self):
        cls = StorageUnitConverter
        self.assertEqual(cls.convert(268337524, cls.KB, cls.GB), 255.91)
        self.assertEqual(cls.convert(268337524, cls.KB, cls.MB), 262048.36)
        self.assertEqual(cls.convert(255.906604767, cls.GB, cls.KB), 268337524)
        self.assertEqual(cls.convert(118806802432 + 2199004377088 + 2199004377088 + 1054863360, cls.BYTES, cls.GB), 4207.59)
        self.assertEqual(cls.convert(118806802432, cls.BYTES, cls.GB), 110.65)

if __name__ == '__main__':
    unittest.main()
