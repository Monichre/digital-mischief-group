import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  args: {
    placeholder: 'Capture key findings, risks, and next steps…',
    className: 'w-[420px]',
  },
}

export default meta

export const Default = {}

export const BriefingStates = {
  render: () => (
    <div className="grid w-[460px] gap-5">
      <div className="space-y-2">
        <Label htmlFor="textarea-default-state">Research notes</Label>
        <Textarea
          id="textarea-default-state"
          rows={4}
          placeholder="Summarize what changed on the target page…"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="textarea-invalid-state">Escalation reason</Label>
        <Textarea
          id="textarea-invalid-state"
          rows={4}
          aria-invalid
          defaultValue="Need to investigate"
        />
        <p className="text-destructive text-sm">
          Add enough detail for the next operator to reproduce the issue.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="textarea-disabled-state">Archived summary</Label>
        <Textarea
          id="textarea-disabled-state"
          rows={5}
          disabled
          defaultValue="Archived after export on 2026-03-11. No further edits allowed."
        />
      </div>
    </div>
  ),
}

export const ShortAndLongForm = {
  render: () => (
    <div className="grid w-[520px] gap-5">
      <div className="space-y-2">
        <Label htmlFor="textarea-short">Quick note</Label>
        <Textarea
          id="textarea-short"
          rows={3}
          defaultValue="Observed a pricing banner update and a new CTA in the hero."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="textarea-long">Long-form briefing</Label>
        <Textarea
          id="textarea-long"
          rows={8}
          defaultValue={`- Homepage hero replaced with product-led copy.
- Pricing page now highlights annual discounts above the fold.
- New customer logos were added to the trust strip.
- Recommend routing to Observe so future changes trigger summaries automatically.`}
        />
      </div>
    </div>
  ),
}
