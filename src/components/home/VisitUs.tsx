import { ContactCards } from '@/components/contact/ContactCards'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function VisitUs() {
  return (
    <section id="visit" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Find us"
          title="Right where your office is."
          description="On the 3rd floor of Al Ghaffar Mall — and at your desk a few minutes later."
        />

        <div className="mt-10">
          <ContactCards />
        </div>
      </Container>
    </section>
  )
}
