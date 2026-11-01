"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Callout,
  Card,
  Input,
  MarkDownRenderer,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Steps,
  StepsItem,
  SwitchItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  TextArea,
  ThemeProvider,
} from "@openuidev/react-components";
import { useState } from "react";

export default function Page() {
  const [dark, setDark] = useState(false);
  const [sent, setSent] = useState(false);
  const [visit, setVisit] = useState("morning");
  return (
    <ThemeProvider
      mode={dark ? "dark" : "light"}
      lightTheme={{ interactiveAccentDefault: "#174ec4", interactiveAccentHover: "#123e9e" }}
    >
      <div className="commons min-h-screen" data-mode={dark ? "dark" : "light"}>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-6 py-7">
          <a className="brand text-2xl" href="#">
            Common
            <br />
            Ground<span aria-hidden="true">®</span>
          </a>
          <nav aria-label="Main" className="flex gap-6 text-sm">
            <a href="#space">The space</a>
            <a href="#membership">Membership</a>
            <a href="#visit">Visit us</a>
          </nav>
          <SwitchItem label="Dark mode" checked={dark} onChange={setDark} />
        </header>
        <main id="main">
          <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 md:grid-cols-2 md:py-20">
            <div>
              <Tag text="Your neighborhood, with a desk." variant="info" />
              <h1 className="my-7 text-6xl font-bold leading-none tracking-tight md:text-7xl">
                A good place
                <br />
                to do your
                <br />
                own thing.
              </h1>
              <p className="mb-8 max-w-md text-lg opacity-75">
                Room to focus. People to meet. A familiar corner of the city that makes working for
                yourself feel a little less by yourself.
              </p>
              <Button
                size="large"
                className="bg-emerald-700 shadow-md hover:bg-emerald-800"
                onClick={() =>
                  document.getElementById("visit")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Come take a look
              </Button>
            </div>
            <div
              className="floorplan"
              role="img"
              aria-label="Illustrated workspace floor plan with a quiet room, shared tables, a meeting room, and a coffee corner"
            >
              <div className="room quiet">
                <span>Quiet room</span>
                <div aria-hidden="true">▤ &nbsp; ▤ &nbsp; ▤</div>
              </div>
              <div className="room coffee">
                <span>Coffee & company</span>
                <div aria-hidden="true">◉</div>
              </div>
              <div className="room shared">
                <span>Make yourself at home</span>
                <div className="desk" aria-hidden="true">
                  ▰ &nbsp; ▰<br />▰ &nbsp; ▰
                </div>
                <small>Shared tables</small>
              </div>
              <div className="room meeting">
                <span>Big ideas room</span>
                <div aria-hidden="true">▱</div>
              </div>
            </div>
          </section>
          <section id="space" className="feature-band py-14">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="mb-9 text-4xl font-bold tracking-tight">Find your kind of workday.</h2>
              <div className="grid gap-8 md:grid-cols-3">
                {[
                  [
                    "Head down",
                    "Quiet zones, comfortable chairs, and reliable Wi-Fi. Everything you need to get into your flow.",
                  ],
                  [
                    "Ideas out loud",
                    "Book a room for the brainstorm, the pitch, or the call that deserves more than your kitchen table.",
                  ],
                  [
                    "A proper break",
                    "Good coffee, a shared lunch table, and neighbors who might become your next collaborators.",
                  ],
                ].map(([title, copy]) => (
                  <Card width="full" key={title}>
                    <h3 className="text-2xl font-bold">{title}</h3>
                    <p className="opacity-75">{copy}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
          <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
            <div>
              <h2 className="mb-7 text-4xl font-bold tracking-tight">There’s a seat for you.</h2>
              <Tabs defaultValue="solo">
                <TabsList aria-label="Ways to work">
                  <TabsTrigger value="solo" text="Just you" />
                  <TabsTrigger value="team" text="Your small team" />
                </TabsList>
                <TabsContent value="solo">
                  <MarkDownRenderer
                    textMarkdown={
                      "**Your routine, with room to breathe.** Drop in when the house gets too quiet, or make us your everyday base.\n\nBring your laptop. We’ll put the coffee on."
                    }
                  />
                </TabsContent>
                <TabsContent value="team">
                  <MarkDownRenderer
                    textMarkdown={
                      "**A place to come together.** Get the team around one table for the days when being in the same room makes a difference.\n\nMeeting rooms are bookable by the hour. Ask about a regular team day."
                    }
                  />
                </TabsContent>
              </Tabs>
              <Callout
                title="A neighborly welcome"
                variant="info"
                description="Your first tour includes a coffee and a look around. No sales presentation attached."
              />
            </div>
            <div>
              <Steps>
                <StepsItem
                  title="Drop us a note"
                  details="Pick a time of day that works for you."
                />
                <StepsItem
                  title="Meet the neighborhood"
                  details="We’ll show you the rooms and introduce you around."
                />
                <StepsItem
                  title="Try a workday"
                  details="Find your favorite seat before choosing a membership."
                />
              </Steps>
            </div>
          </section>
          <section id="membership" className="mx-auto max-w-6xl px-6 py-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-4xl font-bold tracking-tight">Stay a day. Stay a while.</h2>
              <p className="opacity-75">Simple memberships for changing weeks.</p>
            </div>
            <Table aria-label="Membership comparison">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Membership</TableHead>
                  <TableHead scope="col">Make it yours</TableHead>
                  <TableHead scope="col">Meeting room time</TableHead>
                  <TableHead scope="col">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["Day guest", "One good workday", "Pay as you go", "$25 / day"],
                  ["Regular", "8 days each month", "2 hours included", "$160 / month"],
                  ["Resident", "Every weekday", "6 hours included", "$290 / month"],
                ].map((row) => (
                  <TableRow key={row[0]}>
                    {row.map((cell) => (
                      <TableCell key={cell}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-4 text-sm opacity-65">
              Coffee, Wi-Fi, and a warm welcome included. Illustrative demo pricing.
            </p>
          </section>
          <section className="mx-auto grid max-w-6xl gap-14 px-6 py-16 md:grid-cols-2">
            <div>
              <h2 className="mb-7 text-4xl font-bold tracking-tight">Before you drop by.</h2>
              <Accordion type="single" collapsible>
                <AccordionItem value="hours">
                  <AccordionTrigger text="When can I come in?" />
                  <AccordionContent>
                    Our example workspace is open Monday to Friday, 8 am to 7 pm. Tours happen
                    during the working day.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="calls">
                  <AccordionTrigger text="Where can I take calls?" />
                  <AccordionContent>
                    Use a phone booth for a quick call or book a meeting room for something longer.
                    Quiet rooms stay quiet.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="booking">
                  <AccordionTrigger text="Will this book a real tour?" />
                  <AccordionContent>
                    This fictional workspace is a demo. The form confirms on this page only; no
                    details are sent or stored.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <form
              id="visit"
              className="visit-form flex flex-col gap-3 p-7 md:p-9"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <Tag text="The coffee’s on us" variant="info" />
              <h2 className="mb-3 text-3xl font-bold tracking-tight">Meet your next work spot.</h2>
              <label htmlFor="name">Your name</label>
              <Input id="name" name="name" autoComplete="name" placeholder="Alex Taylor" required />
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
              <label htmlFor="time">A good time to visit</label>
              <Select value={visit} onValueChange={setVisit}>
                <SelectTrigger id="time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning, please</SelectItem>
                  <SelectItem value="afternoon">An afternoon works</SelectItem>
                  <SelectItem value="either">Either is good</SelectItem>
                </SelectContent>
              </Select>
              <label htmlFor="note">Anything we should know?</label>
              <TextArea id="note" name="note" placeholder="A desk for one, a room for five…" />
              <Button type="submit">Preview my visit</Button>
              <div aria-live="polite">
                {sent && (
                  <Callout
                    variant="success"
                    title="We’ve saved you an imaginary seat."
                    description="Demo complete. No tour was booked and your details were not sent."
                  />
                )}
              </div>
            </form>
          </section>
        </main>
        <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-10">
          <a href="#" className="brand text-xl">
            Common Ground®
          </a>
          <p className="text-sm opacity-65">Independent work. Shared company.</p>
          <span className="text-xs opacity-65">Fictional workspace · OpenUI example</span>
        </footer>
      </div>
    </ThemeProvider>
  );
}
