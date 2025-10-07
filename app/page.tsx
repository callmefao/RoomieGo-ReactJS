import Header from "@/components/Header"
import SearchSection from "@/components/SearchSection"
import FeaturedRoomsSlider from "@/components/FeaturedRoomsSlider"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SearchSection />
        <FeaturedRoomsSlider />
      </main>
      <Footer />
    </div>
  )
}
