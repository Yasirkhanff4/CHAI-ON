import { ContactCards } from '@/components/contact/ContactCards'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function VisitUs() {
  return (
    <section id="visit" className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Find us"
          title="Come by the shop."
          description="3rd floor of Al Ghaffar Mall, G-11 Markaz. We are open every day."
        />

        <div className="mt-8">
          <ContactCards />
        </div>
      </Container>
    </section>
  )
}
