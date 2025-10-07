import { notFound } from "next/navigation"
import Header from "@/components/Header"
import RentalDetailContent from "@/components/RentalDetailContent"
import Footer from "@/components/Footer"
import { mockRentalData } from "@/lib/mock-data/rooms"
import { parseSlugToId, validateRentalSlug, generateRentalSlug } from "@/lib/utils/url"

interface PageProps {
  params: {
    slug: string
  }
}

export default function RentalDetailPage({ params }: PageProps) {
  const { slug } = params

  // Parse slug để lấy ID
  const propertyId = parseSlugToId(slug)
  if (!propertyId) {
    notFound()
  }

  // Tìm rental data theo ID
  const rental = mockRentalData[propertyId as keyof typeof mockRentalData]
  if (!rental) {
    notFound()
  }

  // Kiểm tra xem slug có đúng format không bằng utility function
  if (!validateRentalSlug(slug, rental.name, propertyId)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <RentalDetailContent rental={rental} />
      </main>
      <Footer />
    </div>
  )
}

export async function generateStaticParams() {
  return Object.values(mockRentalData).map((rental) => {
    const slug = generateRentalSlug(rental.name, parseInt(rental.id))
    
    return {
      slug: slug,
    }
  })
}
