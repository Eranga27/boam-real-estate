export const kpis = [
{ label: 'Active Listings', value: '512', trend: '+4.2%', tone: 'navy' as const },
{ label: 'Sales Closed (YTD)', value: '48', trend: '+11.5%', tone: 'sea' as const },
{ label: 'New Inquiries', value: '196', trend: '+8.1%', tone: 'amber' as const },
{ label: 'Unanswered > 24h', value: '7', trend: '-2.4%', tone: 'red' as const }];


export const listingsByMonth = [
{ month: 'Jan', listings: 28, inquiries: 62 },
{ month: 'Feb', listings: 34, inquiries: 71 },
{ month: 'Mar', listings: 41, inquiries: 88 },
{ month: 'Apr', listings: 37, inquiries: 79 },
{ month: 'May', listings: 46, inquiries: 104 },
{ month: 'Jun', listings: 52, inquiries: 118 },
{ month: 'Jul', listings: 49, inquiries: 112 },
{ month: 'Aug', listings: 58, inquiries: 131 }];


export const typeDistribution = [
{ name: 'House', value: 214, color: '#12355B' },
{ name: 'Apartment', value: 148, color: '#3a6aa2' },
{ name: 'Land', value: 86, color: '#F4A300' },
{ name: 'Commercial', value: 38, color: '#2E8B57' },
{ name: 'Condo', value: 26, color: '#94b3d5' }];


export const recentInquiries = [
{
  name: 'Amara Fernando',
  property: 'Ocean-Facing Modern Villa',
  city: 'Galle',
  when: '12 min ago',
  status: 'New' as const
},
{
  name: 'Dinesh Rajapaksa',
  property: 'Luxury Sky Residence, Colombo 03',
  city: 'Colombo',
  when: '1 hr ago',
  status: 'New' as const
},
{
  name: 'Sarah Whitfield',
  property: 'Beachfront Family Home',
  city: 'Negombo',
  when: '3 hrs ago',
  status: 'Contacted' as const
},
{
  name: 'Kavindu Silva',
  property: 'Colonial Estate Bungalow',
  city: 'Kandy',
  when: 'Yesterday',
  status: 'Viewing set' as const
},
{
  name: 'Nadeeka Perera',
  property: 'Prime Commercial Land',
  city: 'Colombo',
  when: '2 days ago',
  status: 'Closed' as const
}];