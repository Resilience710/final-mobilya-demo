// Database types for FINAL MOBİLYA

export type UserRole = 'admin' | 'customer';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'awaiting' | 'pending' | 'paid' | 'failed' | 'refunded';
export type CampaignScope = 'all' | 'featured' | 'category';
export type CampaignTheme = 'sunset' | 'forest' | 'midnight';
export type ProductDiscountType = 'percentage' | 'fixed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  product_count?: number;
  created_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  subtitle: string | null;
  badge_text: string | null;
  cta_label: string | null;
  cta_href: string | null;
  theme: CampaignTheme;
  discount_percentage: number | null;
  scope: CampaignScope;
  category_id: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at?: string;
  category?: Category | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  base_price: number;
  discount_price: number | null;
  currency: string;
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  sku: string | null;
  images: string[];
  tags: string[];
  specifications: Record<string, string>;
  created_at: string;
  updated_at: string;
  // Relations
  category?: Category;
  variants?: ProductVariant[];
  reviews?: Review[];
  active_campaign?: Campaign | null;
  active_product_discount?: ProductDiscount | null;
  has_product_discount_schedule?: boolean;
}

export interface ProductDiscount {
  id: string;
  product_id: string;
  title: string | null;
  discount_type: ProductDiscountType;
  discount_value: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ShippingRule {
  id: string;
  city: string;
  district: string | null;
  price: number;
  is_active: boolean;
  note: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Store {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  map_url: string | null;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface HomepageGalleryItem {
  id: string;
  slot_index: number;
  image_url: string | null;
  alt_text: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export type HomepageFeaturedTabKey = 'discounted' | 'bestsellers' | 'newest';

export interface HomepageHeroSlide {
  image: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
}

export interface HomepageCategoryItem {
  label: string;
  href: string;
}

export interface HomepageCategoriesSection {
  heading: string;
  items: HomepageCategoryItem[];
}

export interface HomepageBrandStoryCard {
  image: string;
  imageAlt: string;
  headline: string;
  ctaLabel: string;
  href: string;
}

export interface HomepageBrandStorySection {
  leftBadgeLabel: string;
  leftBadgeYear: string;
  leftCard: HomepageBrandStoryCard;
  centerTitle: string;
  centerSubtitle: string;
  centerCtaLabel: string;
  centerCtaHref: string;
  rightCard: HomepageBrandStoryCard;
}

export interface HomepageFeaturedTab {
  key: HomepageFeaturedTabKey;
  label: string;
  href: string;
  cta: string;
}

export interface HomepageFeaturedProductsSection {
  tabs: HomepageFeaturedTab[];
}

export interface HomepageShopTheLookSection {
  backgroundImage: string;
  backgroundImageAlt: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface HomepagePopupSection {
  isActive: boolean;
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  image: string;
  imageAlt: string;
}

export interface HomepageRoomShowcaseItem {
  label: string;
  href: string;
  image: string;
  imageAlt: string;
  ctaLabel: string;
}

export interface HomepageRoomShowcaseSection {
  items: HomepageRoomShowcaseItem[];
}

export interface HomepageGallerySlotItem {
  href: string;
}

export interface HomepageGallerySection {
  items: HomepageGallerySlotItem[];
}

export interface HomepageCollectionSection {
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface HomepageTestimonialsItem {
  text: string;
  name: string;
}

export interface HomepageTestimonialsSection {
  heading: string;
  items: HomepageTestimonialsItem[];
}

export interface HomepageTrustItem {
  title: string;
  description: string;
}

export interface HomepageTrustBarSection {
  heading: string;
  items: HomepageTrustItem[];
}

export interface HomepageContent {
  hero: {
    slides: HomepageHeroSlide[];
  };
  popup: HomepagePopupSection;
  categories: HomepageCategoriesSection;
  brandStory: HomepageBrandStorySection;
  featuredProducts: HomepageFeaturedProductsSection;
  shopTheLook: HomepageShopTheLookSection;
  gallery: HomepageGallerySection;
  roomShowcase: HomepageRoomShowcaseSection;
  allProducts: HomepageCollectionSection;
  blogHighlights: HomepageCollectionSection;
  testimonials: HomepageTestimonialsSection;
  trustBar: HomepageTrustBarSection;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price_modifier: number;
  stock_quantity: number;
  color: string | null;
  size: string | null;
  material: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_price: number;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  currency: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district: string | null;
  shipping_postal_code: string | null;
  shipping_phone: string;
  payment_method: string | null;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  payment_data: Record<string, any>;
  customer_note: string | null;
  admin_note: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  profile?: Profile;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url: string | null;
  created_at: string;
  // Relations
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  profile?: Profile;
}

// Cart types (client-side)
export interface CartItem {
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
}

export interface CartShippingSelection {
  city: string;
  district: string;
  price: number;
  note: string | null;
}

// Checkout form
export interface CheckoutFormData {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district: string;
  shipping_postal_code: string;
  shipping_phone: string;
  buyer_identity_number?: string;
  customer_note: string;
}

// Homepage content types
export interface HeroSlide {
  id: string;
  sort_order: number;
  image_url: string | null;
  title1: string;
  title2: string;
  italic_text: string;
  cta_text: string;
  cta_href: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  review_text: string;
  rating: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface TrustFeature {
  id: string;
  icon_name: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface RoomCollection {
  id: string;
  label: string;
  href: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface BrandStoryContent {
  heading_line1: string;
  heading_line2: string;
  heading_line3: string;
  subtitle_line1: string;
  subtitle_line2: string;
  cta_text: string;
  cta_href: string;
  left_image_url: string;
  left_image_label: string;
  left_image_href: string;
  right_image_url: string;
  right_image_label: string;
  right_image_href: string;
}

// Admin stats
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  recentOrders: Order[];
}
