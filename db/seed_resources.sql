-- Seed: 12 well-known Georgia autism resources.
--
-- IMPORTANT: These entries use publicly-available information from each
-- organization's website. Phone numbers, addresses, and service details
-- MUST be re-verified by the AutismConnect team directly with each
-- provider before the app goes into production. Mark unverified
-- entries as hidden in the admin panel until confirmed.
--
-- Run this AFTER db/schema.sql. Safe to re-run (uses ON CONFLICT on name).
-- Upsert key: name — swap to a natural unique constraint for production.

create unique index if not exists resources_name_key on public.resources (name);

insert into public.resources (
  name, description, resource_type, address, city, state, zip_code,
  phone, website, email, accepts_insurance, specializations
) values
-- ================= DIAGNOSTIC / DOCTOR =================
(
  'Marcus Autism Center',
  'Part of Children''s Healthcare of Atlanta and Emory University, Marcus Autism Center provides diagnostic evaluations, therapy, and research. One of the largest autism-focused centers in the Southeast.',
  'doctor',
  '1920 Briarcliff Road NE',
  'Atlanta', 'GA', '30329',
  '404-785-9400',
  'https://www.marcus.org',
  null,
  true,
  array['autism', 'diagnostic', 'aba', 'feeding_therapy', 'research']
),
(
  'Emory Autism Center',
  'Clinical services, research, and community outreach for children and adults with autism spectrum disorder, based at Emory University School of Medicine.',
  'doctor',
  '1551 Shoup Court',
  'Decatur', 'GA', '30033',
  '404-727-8350',
  'https://www.psychiatry.emory.edu/programs/autism',
  null,
  true,
  array['autism', 'diagnostic', 'adult_services']
),

-- ================= THERAPY =================
(
  'Runnymede Therapeutic Riding Center',
  'Equine-assisted therapy for children and adults with autism and developmental disabilities. Serves Middle Georgia.',
  'therapy',
  '1500 Millstead Road',
  'Warner Robins', 'GA', '31093',
  '478-923-2474',
  'https://www.runnymedetrc.org',
  'info@runnymedetrc.org',
  false,
  array['autism', 'equine_therapy', 'developmental_disabilities']
),
(
  'Atlanta Speech School',
  'Nationally recognized school and clinic for children with speech, language, and learning differences. Serves many autistic children.',
  'therapy',
  '3160 Northside Parkway NW',
  'Atlanta', 'GA', '30327',
  '404-233-5332',
  'https://www.atlantaspeechschool.org',
  null,
  true,
  array['autism', 'speech_therapy', 'language_therapy', 'auditory_oral']
),
(
  'Hope Center for Autism',
  'ABA therapy services for children with autism. Center-based and in-home options.',
  'therapy',
  null,
  'Newnan', 'GA', null,
  null,
  'https://www.hopecenterforautism.org',
  null,
  true,
  array['autism', 'aba', 'in_home_therapy']
),
(
  'Behavioral Momentum',
  'ABA therapy provider serving children with autism and related disorders across Georgia.',
  'therapy',
  null,
  'Atlanta', 'GA', null,
  null,
  'https://www.behavioralmomentum.com',
  null,
  true,
  array['autism', 'aba']
),

-- ================= SCHOOLS =================
(
  'Cumberland Academy of Georgia',
  'Accredited private school for students in grades 4-12 with high-functioning autism, ADHD, and learning differences.',
  'school',
  '2550 Sandy Plains Road',
  'Marietta', 'GA', '30066',
  '404-835-9000',
  'https://www.cumberlandacademy.org',
  null,
  false,
  array['autism', 'asd_level_1', 'adhd', 'learning_differences', 'grades_4_12']
),
(
  'The Howard School',
  'K-12 school for students with language-based learning differences and related challenges including autism.',
  'school',
  '1192 Foster Street NW',
  'Atlanta', 'GA', '30318',
  '404-377-7436',
  'https://www.howardschool.org',
  null,
  false,
  array['autism', 'learning_differences', 'language_based_learning', 'k_12']
),

-- ================= NONPROFIT / ADVOCACY =================
(
  'Autism Society of Georgia',
  'State-wide nonprofit providing information, referral, advocacy, and community for autistic individuals and their families.',
  'nonprofit',
  null,
  'Atlanta', 'GA', null,
  null,
  'https://www.autismsocietyofga.org',
  null,
  null,
  array['autism', 'advocacy', 'support_group', 'parent_support', 'referral']
),
(
  'Parent to Parent of Georgia',
  'Statewide parent-to-parent support network. Matches families of children with disabilities, including autism, with trained volunteer mentors.',
  'nonprofit',
  null,
  'Atlanta', 'GA', null,
  '770-451-5484',
  'https://www.p2pga.org',
  null,
  null,
  array['autism', 'parent_support', 'mentor_matching', 'iep_support']
),
(
  'Georgia Advocacy Office',
  'Protection and advocacy system for Georgians with disabilities. Offers legal and systemic advocacy including for autistic individuals.',
  'nonprofit',
  '150 E Ponce de Leon Avenue, Suite 430',
  'Decatur', 'GA', '30030',
  '404-885-1234',
  'https://thegao.org',
  null,
  null,
  array['autism', 'advocacy', 'legal_aid', 'iep_support', 'disability_rights']
),
(
  'Babies Can''t Wait (Georgia Early Intervention)',
  'Georgia''s statewide Part C program providing early intervention services for infants and toddlers (birth to 3) with developmental delays and disabilities, including autism.',
  'nonprofit',
  null,
  'Atlanta', 'GA', null,
  '800-229-2038',
  'https://dph.georgia.gov/babies-cant-wait',
  null,
  true,
  array['autism', 'early_intervention', 'birth_to_3', 'state_program']
)
on conflict (name) do nothing;
