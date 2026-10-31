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

const features = [
  [
    "Record together",
    "A comfortable room, four microphones, and an engineer who knows when to hit record.",
  ],
  ["Find the good bits", "Thoughtful edits, clean sound, and a story that still sounds like you."],
  ["Send it out", "A finished episode, a transcript, and short clips ready for your audience."],
];
const wave = [
  18, 30, 48, 25, 60, 84, 42, 72, 100, 56, 36, 78, 92, 50, 28, 65, 85, 43, 96, 60, 30, 48, 22, 38,
];
const primary = "rounded-full bg-violet-700 px-7 py-3 text-white hover:bg-violet-800";

export default function Page() {
  const [dark, setDark] = useState(false);
  const [sent, setSent] = useState(false);
  const [format, setFormat] = useState("interview");
  return (
    <ThemeProvider mode={dark ? "dark" : "light"}>
      <div className="studio min-h-screen" data-mode={dark ? "dark" : "light"}>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-7">
          <a href="#" className="text-2xl font-black tracking-tight">
            ◉ Signal House
          </a>
          <nav aria-label="Main" className="flex gap-6 text-sm">
            <a href="#sessions">Sessions</a>
            <a href="#plans">Rates</a>
            <a href="#contact">Say hello</a>
          </nav>
          <SwitchItem label="Dark mode" checked={dark} onChange={setDark} />
        </header>
        <main id="main">
          <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center md:pt-20">
            <Tag
              text="An independent podcast studio"
              className="mx-auto w-fit rounded-full bg-violet-100 text-violet-950"
            />
            <h1 className="mx-auto my-7 max-w-4xl text-6xl font-black leading-[0.98] tracking-[-0.065em] md:text-8xl">
              Your voice.
              <br />A little louder.
            </h1>
            <p className="mx-auto max-w-xl text-lg opacity-75">
              You bring the conversation. We bring the room, the craft, and everything it takes to
              make people listen.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button
                className={primary}
                onClick={() =>
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Plan your first session
              </Button>
              <Button
                variant="secondary"
                className="rounded-full px-7 py-3"
                onClick={() =>
                  document.getElementById("sessions")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See what’s included
              </Button>
            </div>
            <div className="tape mx-auto mt-14 max-w-4xl rounded-3xl bg-violet-200 p-6 text-violet-950 md:p-9">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Good conversations start here</span>
                <span>Studio A</span>
              </div>
              <div
                className="flex h-36 items-center justify-center gap-[1.5%] md:h-44"
                aria-hidden="true"
              >
                {wave.map((height, i) => (
                  <span
                    key={i}
                    className="w-[2%] rounded-full bg-violet-700"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs">
                <span>Four seats. Infinite stories.</span>
                <span>Ready when you are.</span>
              </div>
            </div>
          </section>
          <section id="sessions" className="mx-auto max-w-6xl px-6 py-14">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-4xl font-bold tracking-tight">Make something worth hearing.</h2>
              <span className="text-sm opacity-65">From first take to final mix</span>
            </div>
            <div className="grid gap-7 md:grid-cols-3">
              {features.map(([title, description], i) => (
                <Card
                  key={title}
                  width="full"
                  className="rounded-2xl border border-violet-300/40 bg-[var(--panel)] p-7"
                >
                  <span className="text-3xl text-violet-500" aria-hidden="true">
                    {["◎", "≋", "↗"][i]}
                  </span>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="opacity-75">{description}</p>
                </Card>
              ))}
            </div>
          </section>
          <section className="mx-auto grid max-w-6xl gap-12 px-6 py-14 md:grid-cols-2">
            <div>
              <h2 className="mb-7 text-4xl font-bold tracking-tight">A home for your next idea.</h2>
              <Tabs defaultValue="conversation">
                <TabsList aria-label="Session types">
                  <TabsTrigger value="conversation" text="Conversations" />
                  <TabsTrigger value="solo" text="Solo stories" />
                </TabsList>
                <TabsContent value="conversation">
                  <MarkDownRenderer
                    textMarkdown={
                      "**Make room for a better conversation.** Sit across from your guest, settle in, and let us handle the sound.\n\nEvery session includes separate audio tracks, remote guest support, and a sound check."
                    }
                  />
                </TabsContent>
                <TabsContent value="solo">
                  <MarkDownRenderer
                    textMarkdown={
                      "**One voice can fill a room.** Record a personal essay, a guided practice, or the first chapter of something bigger.\n\nWork at your pace with a producer on the other side of the glass."
                    }
                  />
                </TabsContent>
              </Tabs>
            </div>
            <div className="rounded-3xl bg-[var(--panel)] p-8">
              <Steps>
                <StepsItem
                  title="A quick hello"
                  details="Tell us what you want to make. We’ll help you pick a session."
                />
                <StepsItem
                  title="Settle into the studio"
                  details="Meet your engineer, check the levels, and get comfortable."
                />
                <StepsItem
                  title="Leave with a plan"
                  details="Your recordings arrive with clear next steps for the edit."
                />
              </Steps>
            </div>
          </section>
          <section id="plans" className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="mb-3 text-4xl font-bold tracking-tight">
              A session, or a whole season.
            </h2>
            <p className="mb-8 opacity-75">
              Straightforward rates. An engineer included in every booking.
            </p>
            <Table aria-label="Studio plans">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Your plan</TableHead>
                  <TableHead scope="col">Studio time</TableHead>
                  <TableHead scope="col">What comes home</TableHead>
                  <TableHead scope="col">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["First take", "2 hours", "Raw multitrack audio", "$180"],
                  ["Ready to air", "3 hours", "One edited episode", "$390"],
                  ["The series", "4 × 3 hours", "Four edited episodes + clips", "$1,400"],
                ].map((row) => (
                  <TableRow key={row[0]}>
                    {row.map((cell) => (
                      <TableCell key={cell}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6">
              <Callout
                variant="info"
                title="A little room to experiment"
                description="Not sure which session fits? Start with a conversation. These are illustrative demo rates."
              />
            </div>
          </section>
          <section className="mx-auto grid max-w-6xl gap-14 px-6 py-16 md:grid-cols-2">
            <div>
              <h2 className="mb-7 text-4xl font-bold tracking-tight">Before the red light.</h2>
              <Accordion type="single" collapsible>
                <AccordionItem value="gear">
                  <AccordionTrigger text="Do I need my own equipment?" />
                  <AccordionContent>
                    Just bring your idea. Microphones, headphones, recording equipment, and an
                    engineer are included.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="remote">
                  <AccordionTrigger text="Can my guest join remotely?" />
                  <AccordionContent>
                    Yes. We’ll send a guest link and check their audio before your session begins.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="demo">
                  <AccordionTrigger text="Is this a real booking form?" />
                  <AccordionContent>
                    This is a fictional studio. The form confirms locally and does not make a
                    booking or send your information.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <form
              id="contact"
              className="flex flex-col gap-3 rounded-3xl bg-[var(--panel)] p-7 md:p-9"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <h2 className="mb-3 text-3xl font-bold tracking-tight">Tell us your story.</h2>
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="rounded-xl"
              />
              <label htmlFor="format">What are you making?</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interview">An interview podcast</SelectItem>
                  <SelectItem value="solo">A solo series</SelectItem>
                  <SelectItem value="other">Something a little different</SelectItem>
                </SelectContent>
              </Select>
              <label htmlFor="idea">The idea</label>
              <TextArea
                id="idea"
                name="idea"
                placeholder="It starts with a conversation about…"
                className="rounded-xl"
              />
              <Button type="submit" className={`${primary} mt-3`}>
                Preview session request
              </Button>
              <div aria-live="polite">
                {sent && (
                  <Callout
                    variant="success"
                    title="Your idea has a place here."
                    description="Demo request complete. Nothing was sent or booked."
                  />
                )}
              </div>
            </form>
          </section>
        </main>
        <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-violet-300/40 px-6 py-9">
          <a className="font-bold" href="#">
            ◉ Signal House
          </a>
          <span className="text-sm opacity-65">Good stories deserve good sound.</span>
          <span className="text-xs opacity-65">Fictional studio · OpenUI example</span>
        </footer>
      </div>
    </ThemeProvider>
  );
}
