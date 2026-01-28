import { ImageSourcePropType } from 'react-native';

export interface Category {
  id: string;
  name: string;
  icon: string; // URL or local asset key
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId: string;
  image: string; // URL
  rating: number;
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Bánh Kẹo', icon: 'candy' },
  { id: '2', name: 'Trà & Café', icon: 'coffee' },
  { id: '3', name: 'Đồ Khô', icon: 'food-drumstick' },
  { id: '4', name: 'Gia Vị', icon: 'shaker-outline' }, // MaterialCommunityIcons
  { id: '5', name: 'Quà Tặng', icon: 'gift' },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Bánh Pía Sóc Trăng',
    price: 85000,
    description: 'Bánh pía sầu riêng trứng muối thơm ngon, đặc sản Sóc Trăng.',
    categoryId: '1',
    image: 'https://cdn.tgdd.vn/Files/2021/08/13/1374917/cach-lam-banh-pia-soc-trang-thom-ngon-don-gian-ai-cung-lam-duoc-202201061036081491.jpg',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Cà Phê Buôn Ma Thuột',
    price: 120000,
    description: 'Cà phê rang xay nguyên chất, đậm đà hương vị Tây Nguyên.',
    categoryId: '2',
    image: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNvZmZlZXxlbnwwfHwwfHx8MA%3D%3D',
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Trâu Gác Bếp',
    price: 350000,
    description: 'Thịt trâu gác bếp Tây Bắc, tẩm ướp gia vị mắc khén đặc trưng.',
    categoryId: '3',
    image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/344/218/products/thit-trau-gac-bep-1.jpg?v=1545464478147',
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Mắm Tôm Chà',
    price: 95000,
    description: 'Mắm tôm chà Gò Công, hương vị đậm đà khó quên.',
    categoryId: '4',
    image: 'https://dacsanmientay.vn/assets/uploads/2016/06/mam-tom-cha-go-cong-ba-hai.jpg',
    rating: 4.5,
  },
  {
    id: '5',
    name: 'Nem Chua Thanh Hóa',
    price: 50000,
    description: 'Nem chua đặc sản Thanh Hóa, vị chua cay mặn ngọt hài hòa.',
    categoryId: '3',
    image: 'https://bizweb.dktcdn.net/100/364/402/products/nem-chua-thanh-hoa-1.jpg?v=1684397330767',
    rating: 4.6,
  },
   {
    id: '6',
    name: 'Trà Sen Tây Hồ',
    price: 450000,
    description: 'Trà ướp gạo sen Tây Hồ, tinh hoa quà Việt.',
    categoryId: '2',
    image: 'https://bizweb.dktcdn.net/100/368/970/products/tra-sen-tay-ho-1-80f08405-24d1-447a-8fbc-61f8a8553229.jpg?v=1605670851600',
    rating: 5.0,
  },
];
