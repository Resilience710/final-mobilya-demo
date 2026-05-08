export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: string;
  coverImage: string;
  highlights: string[];
  content: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'mimari-tarz-ne-anlama-gelir',
    title: 'Mimari Tarz Ne Anlama Gelir? Temel Kavramlar ve Dekorasyon Dili',
    excerpt:
      'Klasik, modern, İskandinav ve çağdaş çizgilerin nasıl ayrıştığını; doğru mobilya, renk ve doku seçimiyle yaşam alanına nasıl karakter kazandırdığını keşfedin.',
    category: 'Dekorasyon Rehberi',
    publishedAt: '2026-05-06',
    readTime: '6 dk',
    coverImage: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1400&q=85',
    highlights: [
      'Mimari tarz; form, malzeme ve renk kararlarının ortak dilidir.',
      'Bir mekanda en güçlü etkiyi mobilya silueti ve boşluk kullanımı oluşturur.',
      'Tarzları karıştırırken ortak bir malzeme ya da ton ailesi seçmek denge sağlar.',
    ],
    content: [
      'Mimari tarz, bir mekanın yalnızca nasıl göründüğünü değil nasıl hissettirdiğini de belirleyen bütünlüklü bir tasarım dilidir. Tavan yüksekliği, pencere oranları, zemin seçimi, duvar dokusu ve mobilya formu aynı hikayenin parçalarıdır. Bu nedenle bir evi dekore ederken sadece tek tek güzel ürünler seçmek yeterli olmaz; seçilen parçaların aynı mekansal karakteri desteklemesi gerekir.',
      'Modern tarz daha sade çizgiler, net yüzeyler ve gereksiz detaylardan arınmış bir görünüm sunarken klasik tarz simetri, belirgin çerçeveler ve daha güçlü dekoratif vurgularla öne çıkar. İskandinav yaklaşımı ise açıklık, doğal ışık ve sıcak nötr tonları merkeze alır. Çağdaş yorumlarda ise bu stiller daha yumuşak geçişlerle birleşebilir ve mekan daha kişisel hale gelir.',
      'Mobilya seçiminde yapılacak en doğru başlangıç, mekanın baskın çizgisini fark etmektir. Geniş ve yüksek tavanlı bir salonda ince metal detaylı hafif formlar oldukça modern görünürken, daha sıcak ve aile odaklı bir yaşam alanında ahşap dokular ve yumuşak kumaş geçişleri daha dengeli sonuç verir. Final Mobilya koleksiyonlarında bu nedenle aynı kategori altında farklı çizgilere hitap eden alternatifler sunmak önemlidir.',
      'Tarzları bir araya getirirken en sık yapılan hata, her güçlü fikri aynı odada eşit ağırlıkla kullanmaktır. Bunun yerine bir ana dil seçip diğer etkileri destekleyici unsur gibi kullanmak daha rafine bir sonuç verir. Örneğin modern bir oturma alanında tek bir klasik ayna ya da doğal ceviz bir konsol, mekana karakter katar ama bütünlüğü bozmaz.',
      'Sonuç olarak mimari tarz sabit bir kurallar listesi değil, tutarlı kararlar üretmeyi kolaylaştıran bir çerçevedir. Doğru renk paleti, doğru ölçek ve doğru malzeme birleştiğinde ev daha derli toplu, daha zamansız ve daha yaşanabilir görünür.',
    ],
  },
  {
    slug: 'kucuk-salonlar-icin-ferah-dekorasyon-onerileri',
    title: 'Küçük Salonlar İçin Ferah Dekorasyon Önerileri',
    excerpt:
      'Dar yaşam alanlarında daha geniş bir etki yaratmak için doğru koltuk ölçüsü, açık ton dengesi, aydınlatma ve depolama kararlarını adım adım planlayın.',
    category: 'Salon Fikirleri',
    publishedAt: '2026-05-04',
    readTime: '5 dk',
    coverImage: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1400&q=85',
    highlights: [
      'Küçük salonlarda düşük hacimli ve ayaklı mobilyalar alanı daha hafif gösterir.',
      'Açık tonlar etkili olur ama tek renk zorunlu değildir; kontrast kontrollü kullanılmalıdır.',
      'Depolama çözümleri görünmeyen dağınıklığı azaltarak ferahlık hissini büyütür.',
    ],
    content: [
      'Küçük bir salonu olduğundan daha geniş göstermek için ilk karar mobilya boyutudur. Odayı tamamen dolduran derin koltuklar yerine, yere daha az basan ve ayak detayları görünen tasarımlar tercih edildiğinde alan nefes alır. Bu yaklaşım özellikle girişe yakın ya da pencere önünde yerleşim yapılan planlarda farkı hemen hissettirir.',
      'Renk seçiminde açık tonlar her zaman avantajlıdır; ancak mekanı karakterden arındıracak kadar tekdüze bir yüzey etkisi de yaratılmamalıdır. Krem, kum beji, açık gri ve kırık beyaz tonları ana zemin olarak kullanılırken, ahşap detaylar ve yumuşak desenli tekstiller mekana sıcaklık kazandırır. Böylece salon hem ferah hem de yaşanmış görünür.',
      'Aydınlatma da algıyı doğrudan etkiler. Tek bir tavandan aydınlatma yerine, lambader, duvar aplikleri ve sehpa üstü aydınlatmalarla katmanlı bir sistem kurmak mekana derinlik verir. Özellikle akşam kullanımında gölge dağılımı dengelendiğinde salon daha büyük ve daha düzenli görünür.',
      'Depolama ihtiyacı küçük salonlarda genellikle geri plana atılır; oysa dağınıklığın görünür olması alanı en hızlı küçülten etkidir. Çekmeceli orta sehpa, kapaklı TV ünitesi veya ince formlu konsol gibi parçalar depolama yükünü görünmeden çözer. Böylece dekoratif yüzeyler daha temiz kalır.',
      'Ferah bir salonun temelinde çok eşya değil doğru ölçü, doğru akış ve doğru boşluk vardır. Yerleşimi sadeleştirip gerçekten kullanılan parçaları öne çıkardığınızda küçük alanlar bile oldukça güçlü bir atmosfer sunabilir.',
    ],
  },
  {
    slug: 'yatak-odasinda-huzurlu-bir-atmosfer-nasil-kurulur',
    title: 'Yatak Odasında Huzurlu Bir Atmosfer Nasıl Kurulur?',
    excerpt:
      'Dinlendirici bir yatak odası için renk geçişlerinden başlık seçimine, tekstil katmanlarından aydınlatma sıcaklığına kadar temel tasarım kararlarını inceleyin.',
    category: 'Yatak Odası',
    publishedAt: '2026-05-02',
    readTime: '4 dk',
    coverImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=85',
    highlights: [
      'Yatak odasında düşük kontrast ve yumuşak yüzeyler zihinsel rahatlama sağlar.',
      'Başlık, komodin ve aydınlatma üçlüsü odanın karakterini belirler.',
      'Tekstil katmanları yalnızca konfor değil akustik yumuşaklık da sağlar.',
    ],
    content: [
      'Yatak odası tasarlanırken çoğu zaman sadece takım uyumuna bakılır; oysa gerçek huzur hissi malzeme, ışık ve sesin birlikte kontrol edilmesiyle oluşur. Bu nedenle dinlendirici bir atmosfer kurmak için ilk olarak gereksiz görsel gürültüyü azaltmak gerekir. Net çizgili bir karyola, sade bir başlık ve dengeli komodin oranları odanın temel sakinliğini oluşturur.',
      'Renklerde düşük kontrastlı geçişler en güvenli başlangıçtır. Kırık beyaz, kum beji, sıcak gri, duman mavi veya toprak alt tonları hem gün ışığında yumuşak görünür hem de akşam aydınlatmasında sertleşmez. Bu tonların farklı dokularla desteklenmesi, renk sayısını artırmadan zenginlik sağlar.',
      'Aydınlatmada sarı ve yumuşak tonlu bir sıcaklık tercih etmek, odanın kullanım amacına daha uygundur. Tavandan gelen güçlü ışık yerine başlık çevresinde aplik, komodin üstünde abajur ya da dolaylı ışık kaynakları kullanıldığında dinlenme hissi artar. Özellikle gece rutini için bu geçişler çok önemlidir.',
      'Tekstil katmanları yatak odasını bir anda daha rafine gösterir. Başucu halısı, dokulu yatak örtüsü, dolgun yastıklar ve hafif karartma perdeler birlikte kullanıldığında odanın hem akustiği hem konforu iyileşir. Sert yüzeylerin çoğaldığı odalarda bu katmanlar eksik kalırsa mekan soğuk hissedilir.',
      'Huzurlu bir yatak odası gösterişli olmak zorunda değildir. Asıl amaç, günün sonunda zihni yormayan, güvenli ve sakin bir atmosfer kurmaktır. Doğru ölçekte birkaç güçlü parça ve iyi planlanmış aydınlatma ile bunu kalıcı şekilde sağlamak mümkündür.',
    ],
  },
];

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(slug: string, limit = 2) {
  return blogPosts.filter((post) => post.slug !== slug).slice(0, limit);
}
