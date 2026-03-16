import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3F4F6' }}>
      {/* Fixed Sidebar */}
      <DashboardSidebar user={user} />
      
      {/* Fixed Topbar */}
      <Topbar user={user} />
      
      {/* Main Content Area */}
      <main 
        className="flex-1 overflow-auto"
        style={{
          marginLeft: '260px',
          paddingTop: '64px',
          minHeight: '100vh'
        }}
      >
        <div style={{ padding: '30px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
