import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const services = [
  {
    slug: 'termite-management',
    name: 'Termite Management Solutions',
    icon: 'Bug',
    shortDesc: 'Complete pre and post construction termite treatment with long-term warranty protection.',
    description: `Termites are one of the most destructive pests, silently causing extensive damage to wooden structures, furniture, and even the foundation of buildings. At Hygienic Pest Control Pvt Ltd, we provide comprehensive termite management solutions tailored for both residential and commercial properties across Ranchi and surrounding areas.

Our termite treatment process includes thorough inspection, pre-construction and post-construction chemical barrier treatment using CPMA-certified chemicals, and deep soil and wood treatment to eliminate colonies at their source. We use advanced drilling and injection methods to ensure complete penetration and long-lasting protection.

With warranties ranging from 5 to 10 years and annual inspection included, our termite management service gives you complete peace of mind. Our trained technicians ensure minimal disruption to your daily life while delivering maximum protection against termite infestations.`,
    features: [
      'Pre & Post Construction Treatment',
      '5-10 Year Warranty',
      'CPMA Certified Chemicals',
      'Deep Soil & Wood Treatment',
      'Annual Inspection Included',
    ],
    sortOrder: 1,
  },
  {
    slug: 'household-pest-management',
    name: 'Household Pest Management',
    icon: 'Home',
    shortDesc: 'Safe and effective control of cockroaches, ants, spiders, and other common household pests.',
    description: `Household pests like cockroaches, ants, spiders, and silverfish are not just a nuisance — they carry diseases and contaminate food. Hygienic Pest Control Pvt Ltd offers comprehensive household pest management services designed to keep your home in Ranchi clean, hygienic, and pest-free.

Our treatment uses odorless, child-friendly, and pet-safe chemicals that are effective against a wide range of household pests. We focus on high-risk areas like kitchens, bathrooms, storage rooms, and entry points to ensure thorough coverage and long-lasting results.

We offer flexible quarterly and monthly plans to suit your needs and budget. Our trained professionals conduct a detailed inspection before every treatment to identify pest hotspots and customize the approach accordingly. Enjoy a pest-free home with HPC's trusted household pest management service.`,
    features: [
      'Cockroach, Ant & Spider Control',
      'Odorless & Safe Chemicals',
      'Child & Pet Friendly',
      'Kitchen & Bathroom Focus',
      'Quarterly/Monthly Plans',
    ],
    sortOrder: 2,
  },
  {
    slug: 'bed-bugs-management',
    name: 'Bed Bugs Management Solutions',
    icon: 'BedDouble',
    shortDesc: 'Complete bed bug elimination with steam and chemical combo treatment and follow-up guarantee.',
    description: `Bed bugs are persistent pests that hide in mattresses, furniture crevices, and bed frames, causing itchy bites and sleepless nights. Hygienic Pest Control Pvt Ltd provides a thorough bed bug management solution that targets every stage of the bed bug lifecycle for complete elimination.

Our approach combines high-temperature steam treatment with targeted chemical spraying to reach bed bugs in their hiding spots. We treat mattresses, box springs, headboards, furniture joints, and even wall cracks to ensure no bed bug is left behind. The combination of steam and chemical methods provides immediate knockdown and residual protection.

Every bed bug treatment includes a scheduled follow-up visit to ensure 100% elimination. We stand behind our work with a complete elimination guarantee, making Hygienic Pest Control the trusted choice for bed bug control in Ranchi and Jharkhand.`,
    features: [
      'Complete Room Treatment',
      'Mattress & Furniture Spray',
      'Follow-up Treatment Included',
      'Steam & Chemical Combo',
      '100% Elimination Guarantee',
    ],
    sortOrder: 3,
  },
  {
    slug: 'rodent-management',
    name: 'Rodent Management Solutions',
    icon: 'MousePointer2',
    shortDesc: 'Professional rat and mouse control with bait stations and entry point sealing for lasting results.',
    description: `Rodents such as rats and mice pose serious health risks by contaminating food, spreading diseases, and damaging property through gnawing on wires, pipes, and structures. Hygienic Pest Control Pvt Ltd delivers professional rodent management solutions for homes, offices, warehouses, and commercial establishments in Ranchi.

Our rodent control program includes strategic placement of tamper-resistant bait stations, use of rodenticides in safe and targeted locations, and glue traps where needed. We also provide expert advice on sealing entry points such as gaps in doors, pipes, and ventilation openings to prevent future infestations.

With monthly monitoring visits, we ensure that rodent activity is tracked and controlled on an ongoing basis. Whether you are dealing with a sudden infestation or need a long-term rodent prevention plan, Hygienic Pest Control has the expertise and tools to keep your space rodent-free.`,
    features: [
      'Rat & Mouse Elimination',
      'Bait Station Installation',
      'Entry Point Sealing Advice',
      'Commercial & Residential',
      'Monthly Monitoring',
    ],
    sortOrder: 4,
  },
  {
    slug: 'mosquito-management',
    name: 'Mosquito Management Solutions',
    icon: 'Zap',
    shortDesc: 'Comprehensive mosquito control with fogging, larvicide, and indoor residual spray treatments.',
    description: `Mosquitoes are among the most dangerous pests, responsible for spreading diseases like dengue, malaria, chikungunya, and Japanese encephalitis. In a city like Ranchi with its tropical climate, mosquito control is essential for protecting your family and community. Hygienic Pest Control Pvt Ltd provides advanced mosquito management solutions for both indoor and outdoor spaces.

Our mosquito control services include Indoor Residual Spray (IRS), anti-larva treatment in stagnant water sources, and both thermal and cold fogging for large outdoor areas. We use WHO-recommended chemicals that are effective against mosquitoes while being safe for humans and the environment.

Whether it is your home garden, housing society, office campus, or commercial premises, our mosquito management program provides comprehensive coverage and significantly reduces mosquito populations. Regular treatments during peak mosquito seasons ensure continuous protection against mosquito-borne diseases.`,
    features: [
      'Indoor Residual Spray',
      'Anti-Larva Treatment',
      'Thermal & Cold Fogging',
      'Dengue & Malaria Prevention',
      'Outdoor Area Coverage',
    ],
    sortOrder: 5,
  },
  {
    slug: 'cockroach-management',
    name: 'Cockroach Management Solutions',
    icon: 'Bug',
    shortDesc: 'Targeted cockroach elimination using gel baiting and spray treatments safe for food areas.',
    description: `Cockroaches are one of the most common and resilient pests found in kitchens, restaurants, food processing units, and homes. They carry bacteria and allergens that can cause food poisoning, asthma, and other health issues. Hygienic Pest Control Pvt Ltd offers specialized cockroach management solutions using the latest gel baiting technology and spray treatments.

Our gel baiting approach places small, targeted dots of cockroach gel bait in cracks, crevices, hinges, and other hiding spots where cockroaches are most active. This method is odorless, stain-free, and safe for food preparation areas. For heavy infestations, we combine gel treatment with residual spray application focusing on kitchens, drainage systems, and utility areas.

The treatments we use provide a long-lasting effect, continuing to work for weeks after application. Hygienic Pest Control's cockroach management is trusted by households, restaurants, hotels, and food businesses across Ranchi for effective and safe cockroach control.`,
    features: [
      'Gel Baiting Technology',
      'Spray Treatment',
      'Kitchen & Drainage Focus',
      'Long-lasting Effect',
      'Safe for Food Areas',
    ],
    sortOrder: 6,
  },
  {
    slug: 'wood-borer-management',
    name: 'Wood Borer Management',
    icon: 'TreePine',
    shortDesc: 'Protect your wooden furniture and structures from wood borers with injection and coating treatments.',
    description: `Wood borers are insects whose larvae feed on wood, creating tunnels and weakening wooden furniture, doors, window frames, and structural timber. If left untreated, wood borer damage can be extensive and costly. Hygienic Pest Control Pvt Ltd provides expert wood borer management services to protect your valuable wooden assets in Ranchi.

Our treatment involves injecting specialized insecticides directly into the borer holes and tunnels, ensuring the chemical reaches deep into the wood to eliminate active larvae and adult beetles. We also apply a preventive coating on exposed wood surfaces to create a protective barrier against future infestations. Our treatment covers all types of wood including teak, plywood, particleboard, and hardwood.

With a 5-year warranty on our wood borer treatment, you can trust Hygienic Pest Control to safeguard your furniture, doors, and wooden structures. Our experienced technicians assess the extent of damage and recommend the most effective treatment plan for your specific situation.`,
    features: [
      'Furniture Protection',
      'Injection Treatment',
      'Preventive Coating',
      'All Wood Types Covered',
      '5 Year Warranty',
    ],
    sortOrder: 7,
  },
  {
    slug: 'snake-management',
    name: 'Snake Management Solutions',
    icon: 'AlertTriangle',
    shortDesc: 'Eco-friendly snake repellent treatment and perimeter protection for homes and gardens.',
    description: `Snakes can be a frightening and dangerous presence around homes, gardens, farmhouses, and commercial properties, especially in areas like Ranchi with green surroundings and open spaces. Hygienic Pest Control Pvt Ltd provides professional snake management solutions that keep snakes away without harming them or the environment.

Our snake management service includes application of eco-friendly snake repellents around the perimeter of your property, creating an invisible barrier that deters snakes from entering. We treat garden areas, compound walls, entry gates, basement openings, and other vulnerable spots where snakes are likely to enter.

For emergency situations, our team provides rapid response to safely remove snakes from your premises. We also offer ongoing maintenance treatments to ensure continuous protection throughout the year. Trust Hygienic Pest Control for humane, effective, and eco-friendly snake management in Ranchi.`,
    features: [
      'Snake Repellent Treatment',
      'Perimeter Protection',
      'Emergency Response',
      'Garden & Compound Coverage',
      'Eco-friendly Solutions',
    ],
    sortOrder: 8,
  },
  {
    slug: 'bee-safe-service',
    name: 'Bee Safe Service',
    icon: 'Flower2',
    shortDesc: 'Safe and humane bee removal and hive relocation service with same-day response.',
    description: `Bees play a vital role in our ecosystem, but when they build hives near homes, offices, or public spaces, they can pose a safety risk. Hygienic Pest Control Pvt Ltd offers a specialized Bee Safe Service that focuses on the safe removal and relocation of bee hives without harming the bees.

Our trained professionals use specialized equipment including protective gear, bee smokers, and safe relocation containers to carefully remove bee colonies from walls, ceilings, trees, and other structures. We work with local beekeepers and environmental organizations to ensure the bees are relocated to suitable habitats where they can continue their important role in pollination.

We offer same-day service for urgent bee situations and our team is available for both residential and commercial properties across Ranchi. Choose Hygienic Pest Control's Bee Safe Service for responsible, humane, and professional bee management.`,
    features: [
      'Safe Bee Removal',
      'Hive Relocation',
      'No Harm to Bees',
      'Professional Equipment',
      'Same Day Service',
    ],
    sortOrder: 9,
  },
  {
    slug: 'weed-management',
    name: 'Weed Management Solutions',
    icon: 'Leaf',
    shortDesc: 'Professional weed control for gardens and lawns using selective herbicides and root-level treatment.',
    description: `Weeds compete with your plants for water, nutrients, and sunlight, and can quickly overtake gardens, lawns, driveways, and open areas if not managed properly. Hygienic Pest Control Pvt Ltd provides professional weed management solutions that eliminate existing weeds and prevent regrowth for a clean and beautiful landscape.

Our weed control approach uses selective herbicides that target weeds without damaging your desired plants and grass. We perform root-level elimination to ensure weeds do not grow back, and apply pre-emergent treatments to prevent new weed seeds from germinating. Our team assesses the type of weeds present and customizes the treatment plan accordingly.

With monthly maintenance plans available, Hygienic Pest Control ensures your garden, lawn, commercial landscape, or compound remains weed-free throughout the year. Our experienced team serves residential societies, corporate campuses, parks, and individual homes across Ranchi.`,
    features: [
      'Garden & Lawn Treatment',
      'Selective Herbicides',
      'Root-level Elimination',
      'Preventive Treatment',
      'Monthly Maintenance',
    ],
    sortOrder: 10,
  },
  {
    slug: 'fly-management',
    name: 'Fly Management Solutions',
    icon: 'Wind',
    shortDesc: 'Effective fly control with UV traps, chemical spray, and drainage treatment for commercial spaces.',
    description: `Flies are a major hygiene concern, especially in restaurants, kitchens, food courts, hospitals, and food processing facilities. They carry pathogens that can cause food contamination and spread diseases like typhoid, cholera, and dysentery. Hygienic Pest Control Pvt Ltd provides specialized fly management solutions designed for commercial and residential spaces in Ranchi.

Our fly control program includes installation of UV fly traps that attract and capture flies without chemicals, targeted chemical spray in breeding areas, and comprehensive drainage treatment to eliminate fly breeding sites. For commercial kitchens and restaurants, we offer customized fly management programs that comply with food safety standards and FSSAI guidelines.

Regular monitoring visits ensure that fly populations remain under control, and our team adjusts the treatment approach based on seasonal patterns and specific challenges at your location. Hygienic Pest Control is the preferred fly management partner for leading restaurants, hotels, and food businesses in Ranchi.`,
    features: [
      'UV Fly Traps',
      'Chemical Spray',
      'Drainage Treatment',
      'Restaurant & Kitchen Specialist',
      'Regular Monitoring',
    ],
    sortOrder: 11,
  },
  {
    slug: 'microbial-disinfection',
    name: 'Microbial Disinfection Service',
    icon: 'Shield',
    shortDesc: 'Hospital-grade disinfection and sanitization service for offices, homes, and commercial spaces.',
    description: `In the post-pandemic world, maintaining a sanitized and disinfected environment is more important than ever. Hygienic Pest Control Pvt Ltd provides professional microbial disinfection services using hospital-grade disinfectants that eliminate 99.9% of bacteria, viruses, and other harmful microorganisms from surfaces and the air.

Our disinfection process uses advanced electrostatic spraying technology that ensures even coverage on all surfaces, including hard-to-reach areas. The positively charged disinfectant droplets wrap around surfaces, providing complete 360-degree coverage. We use WHO and EPA-approved disinfectants that are effective against COVID-19, influenza, and a wide range of pathogens.

Every disinfection service comes with a certification of sanitization that you can display for your customers, employees, and visitors. Our service is ideal for offices, homes, schools, hospitals, hotels, shopping malls, and any space where hygiene is a priority. Trust Hygienic Pest Control for professional, certified disinfection services in Ranchi.`,
    features: [
      'Hospital Grade Disinfectant',
      'COVID-19 Sanitization',
      'Office & Home Coverage',
      'Electrostatic Spraying',
      'Certification Provided',
    ],
    sortOrder: 12,
  },
]

const testimonials = [
  {
    name: 'Rajesh Kumar Sinha',
    location: 'Harmu, Ranchi',
    rating: 5,
    text: 'We had a severe termite problem in our newly built house. Hygienic Pest Control did a thorough post-construction termite treatment and the results have been outstanding. It has been over 2 years and there is no sign of termites. Their team was professional, punctual, and explained every step of the process. Highly recommended for anyone in Ranchi looking for reliable pest control!',
    service: 'Termite Management Solutions',
  },
  {
    name: 'Priya Sharma',
    location: 'Kanke Road, Ranchi',
    rating: 5,
    text: 'I was troubled by cockroaches in my kitchen for months. Tried many home remedies but nothing worked. Hygienic Pest Control used gel baiting treatment and within a week, the cockroach problem was completely solved. The chemicals they used were odorless and safe for my children. Very happy with their service and now I have an annual plan with them.',
    service: 'Cockroach Management Solutions',
  },
  {
    name: 'Amit Toppo',
    location: 'Doranda, Ranchi',
    rating: 5,
    text: 'Our office was facing a serious mosquito problem, especially during the monsoon season. Hygienic Pest Control carried out fogging and indoor residual spray treatment in our entire office premises. The difference was immediate and remarkable. We now have a quarterly contract with them and our employees are much more comfortable. Great service at a reasonable price.',
    service: 'Mosquito Management Solutions',
  },
  {
    name: 'Sunita Devi',
    location: 'Lalpur, Ranchi',
    rating: 4,
    text: 'We found a beehive in our balcony and were very scared. Called Hygienic Pest Control and they came the same day. Their team carefully removed the hive and relocated the bees without harming them. I really appreciate their humane approach. The technicians were well-equipped and handled everything very professionally. Thank you HPC team!',
    service: 'Bee Safe Service',
  },
  {
    name: 'Dr. Vikash Oraon',
    location: 'Morabadi, Ranchi',
    rating: 5,
    text: 'I run a clinic in Morabadi and hygiene is our top priority. Hygienic Pest Control provides us regular microbial disinfection and pest management services. They provided us with a sanitization certificate which we display proudly. Their electrostatic spraying technology is impressive and covers every corner. I would recommend them to all healthcare facilities in Ranchi.',
    service: 'Microbial Disinfection Service',
  },
  {
    name: 'Manoj Kumar Mahto',
    location: 'Ratu Road, Ranchi',
    rating: 5,
    text: 'Bed bugs were making our life miserable. We could not sleep properly for weeks. Hygienic Pest Control did a complete room treatment with steam and chemical spray. After the treatment and one follow-up visit, the bed bugs were completely gone. It has been 6 months now and there is no recurrence. Best pest control service in Ranchi without a doubt!',
    service: 'Bed Bugs Management Solutions',
  },
]

async function main() {
  console.log('Starting seed for services and testimonials...')

  // Seed services
  for (const service of services) {
    const existing = await prisma.service.findUnique({
      where: { slug: service.slug },
    })

    if (!existing) {
      await prisma.service.create({ data: service })
      console.log(`Created service: ${service.name}`)
    } else {
      console.log(`Service already exists: ${service.name} — skipping`)
    }
  }

  // Seed testimonials
  const existingTestimonials = await prisma.testimonial.findMany()

  if (existingTestimonials.length === 0) {
    await prisma.testimonial.createMany({ data: testimonials })
    console.log(`Created ${testimonials.length} testimonials`)
  } else {
    console.log(`Testimonials already exist (${existingTestimonials.length} found) — skipping`)
  }

  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
