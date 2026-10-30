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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  TextArea,
  ThemeProvider,
} from "@openuidev/react-components";
import { useState } from "react";

const crops = [
  {
    name: "A few good herbs",
    copy: "Basil, mint, and chives. A fragrant beginning for a sunny windowsill.",
    symbol: "✳",
    color: "herbs",
  },
  {
    name: "Dinner, homegrown",
    copy: "Crisp leaves and climbing beans. Make a little space for something delicious.",
    symbol: "◒",
    color: "vegetables",
  },
  {
    name: "Room for the bees",
    copy: "A changing patchwork of flowers that gives your local pollinators a place to land.",
    symbol: "✿",
    color: "flowers",
  },
];

export default function App() {
  const [dark, setDark] = useState(false);
  const [sent, setSent] = useState(false);
  const [space, setSpace] = useState("balcony");
  return (
    <ThemeProvider mode={dark ? "dark" : "light"}>
      <div className="fieldwork" data-mode={dark ? "dark" : "light"}>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="shell masthead">
          <a className="wordmark" href="#">
            ✳ Fieldwork
          </a>
          <nav aria-label="Main">
            <a href="#grow">What to grow</a>
            <a href="#plans">Membership</a>
          </nav>
          <SwitchItem label="Dark mode" checked={dark} onChange={setDark} />
        </header>
        <main id="main" className="shell">
          <section className="hero">
            <div>
              <Tag text="Small spaces. Good things." variant="success" />
              <h1>
                A little dirt.
                <br />A lot of possibility.
              </h1>
              <p className="intro">
                Turn that spare corner into something living. Seasonal plans, gentle reminders, and
                advice for the garden you actually have.
              </p>
              <Button
                size="large"
                onClick={() =>
                  document.getElementById("signup")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Find your growing rhythm
              </Button>
              <p className="small">No green thumb required. Just a place to begin.</p>
            </div>
            <div
              className="garden"
              role="img"
              aria-label="Illustrated garden plan with herbs, leafy vegetables, and flowers"
            >
              <div className="garden-title">
                Your little patch <span>Spring plan</span>
              </div>
              <div className="beds">
                <div className="bed herbs">
                  ✳ ✳<small>Kitchen herbs</small>
                </div>
                <div className="bed flowers">
                  ✿ ✿<small>Bee favorites</small>
                </div>
                <div className="bed vegetables">
                  ◒ ◒ ◒<small>Cut-and-come-again leaves</small>
                </div>
              </div>
              <div className="garden-note">A sunny spot. Ten minutes a day. Yours.</div>
            </div>
          </section>
          <section id="grow" className="section">
            <div className="section-heading">
              <h2>Start with what you love.</h2>
              <p>One pot is a perfectly good garden.</p>
            </div>
            <div className="feature-grid">
              {crops.map((crop) => (
                <Card width="full" key={crop.name}>
                  <span className={`crop-symbol ${crop.color}`} aria-hidden="true">
                    {crop.symbol}
                  </span>
                  <h3>{crop.name}</h3>
                  <p>{crop.copy}</p>
                </Card>
              ))}
            </div>
          </section>
          <section className="split section">
            <div>
              <h2>
                Less guessing.
                <br />
                More growing.
              </h2>
              <p>A plan that works with your space and the season.</p>
              <Steps>
                <StepsItem
                  title="Tell us about your patch"
                  details="A windowsill, balcony, or a whole backyard."
                />
                <StepsItem
                  title="Meet your plants"
                  details="Choose a small, manageable seasonal collection."
                />
                <StepsItem
                  title="Take it week by week"
                  details="Simple jobs, timely advice, and room to experiment."
                />
              </Steps>
            </div>
            <Card width="full" variant="sunk">
              <Tag text="From the field notes" />
              <h3>Your first week</h3>
              <Tabs defaultValue="balcony">
                <TabsList aria-label="Growing tips">
                  <TabsTrigger value="balcony" text="Balcony" />
                  <TabsTrigger value="windowsill" text="Windowsill" />
                </TabsList>
                <TabsContent value="balcony">
                  <MarkDownRenderer
                    textMarkdown={
                      "**Follow the light.** Watch where the sun falls before choosing your pots.\n\n- Give leafy greens a cooler corner.\n- Choose containers with drainage holes.\n- Water the soil, not the leaves."
                    }
                  />
                </TabsContent>
                <TabsContent value="windowsill">
                  <MarkDownRenderer
                    textMarkdown={
                      "**Start small.** A pot of chives is a lovely first harvest.\n\n- Pick your brightest window.\n- Turn the pot a little each week.\n- Let the top of the soil dry before watering."
                    }
                  />
                </TabsContent>
              </Tabs>
              <Callout
                variant="info"
                title="A note on seasons"
                description="Planting advice adapts to your local climate. These are sample plans."
              />
            </Card>
          </section>
          <section id="plans" className="section plan">
            <div>
              <Tag text="The growing club" />
              <h2>A season of support.</h2>
              <p>Personal planting plans, weekly field notes, and a monthly garden clinic.</p>
            </div>
            <div>
              <p className="price">
                $12 <span>/ month</span>
              </p>
              <p>Cancel whenever your season changes.</p>
              <Button
                onClick={() =>
                  document.getElementById("signup")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore membership
              </Button>
            </div>
          </section>
          <section className="split section">
            <div>
              <h2>A few good questions.</h2>
              <Accordion type="single" collapsible>
                <AccordionItem value="space">
                  <AccordionTrigger text="Do I need a garden?" />
                  <AccordionContent>
                    A sunny windowsill is enough. Your plan starts with the space you have.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="seeds">
                  <AccordionTrigger text="Are seeds included?" />
                  <AccordionContent>
                    Membership includes guidance and plans. You can buy seeds locally using your
                    personalized shopping list.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="demo">
                  <AccordionTrigger text="Can I join here?" />
                  <AccordionContent>
                    This is a fictional product demo. The form shows a local confirmation and never
                    sends your details.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <form
              id="signup"
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
            >
              <h2>What will you grow?</h2>
              <label htmlFor="email">Your email</label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
              <label htmlFor="space">Your growing space</label>
              <Select value={space} onValueChange={setSpace}>
                <SelectTrigger id="space">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balcony">Balcony or patio</SelectItem>
                  <SelectItem value="windowsill">Windowsill</SelectItem>
                  <SelectItem value="garden">Garden beds</SelectItem>
                </SelectContent>
              </Select>
              <label htmlFor="wish">Your wish list</label>
              <TextArea
                id="wish"
                name="wish"
                placeholder="Fresh herbs, flowers, my first tomato…"
              />
              <Button type="submit">Preview my garden plan</Button>
              <div aria-live="polite">
                {sent && (
                  <Callout
                    variant="success"
                    title="Your next season starts small."
                    description={`Your ${space} plan is ready to imagine. This demo has not sent or saved your details.`}
                  />
                )}
              </div>
            </form>
          </section>
        </main>
        <footer className="shell footer">
          <a className="wordmark" href="#">
            ✳ Fieldwork
          </a>
          <p>Good things take a little growing.</p>
          <span>Fictional product · OpenUI example</span>
        </footer>
      </div>
    </ThemeProvider>
  );
}
