import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import ApproveReportClient from './ApproveReportClient'

export default async function ApproveStudentReportPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/sch1/dashboard')
  }

  const report = await prisma.studentReport.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          class: true,
        },
      },
      task: {
        select: {
          title: true,
        },
      },
    },
  })

  if (!report) {
    redirect('/sch1/students')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1/students" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Одобрить отчет</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Отчет от {report.user.name}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <span>{report.user.class} класс</span>
              <span>•</span>
              <span>{report.type === 'GRADE_PHOTO' ? 'Балл за предмет' : report.type === 'SOR' ? 'СОР' : 'Задача'}</span>
              {report.subject && (
                <>
                  <span>•</span>
                  <span>Предмет: {report.subject}</span>
                </>
              )}
              {report.grade && (
                <>
                  <span>•</span>
                  <span>Балл: {report.grade}</span>
                </>
              )}
            </div>
            {report.description && (
              <p className="text-gray-700 mb-4">{report.description}</p>
            )}
            <div className="mb-6">
              <Image 
                src={report.photoUrl} 
                alt="Отчет"
                width={800}
                height={600}
                className="max-w-full rounded-lg" 
                className="max-w-full rounded-lg border-2 border-gray-200"
              />
            </div>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-4">
              <p className="text-green-700 font-semibold">
                Будет начислено: {report.epAmount} EP
              </p>
            </div>
          </div>
          <ApproveReportClient reportId={params.id} />
        </div>
      </div>
    </div>
  )
}

