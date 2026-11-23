import { ContactCards } from '@/components/contact/ContactCards'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { business } from '@/data/site'

export function VisitUs() {
  return (
    <section id="visit" className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Find us"
          title="Come by the shop."
          description={`3rd floor of Al Ghaffar Mall, G-11 Markaz. Open every day, ${business.hours}.`}
        />

        <div className="mt-6">
          <ContactCards />
        </div>
      </Container>
    </section>
  )
}
