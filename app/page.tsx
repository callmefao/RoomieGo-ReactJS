// import Header from "@/components/Header"
import SearchSection from "@/components/SearchSection"
import FeaturedRoomsSlider from "@/components/FeaturedRoomsSlider"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="space-y-8">
        <SearchSection />
        <FeaturedRoomsSlider />
      </section>
      <Footer />
    </div>
  )
}
