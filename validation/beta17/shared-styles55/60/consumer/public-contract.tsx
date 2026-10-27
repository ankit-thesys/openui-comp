import React, {createRef} from 'react';
import {Buttons, Button, FormControl, Hint, TagBlock, Tag, ThemeProvider} from '@openuidev/react-components';
const ref = createRef<HTMLDivElement>();
const valid=<ThemeProvider mode="dark"><Buttons ref={ref} variant="vertical" style={{boxSizing:'content-box'}}><Button>One</Button></Buttons><FormControl ref={ref} hasError style={{boxSizing:'content-box'}}><Hint>Hint</Hint></FormControl><TagBlock ref={ref} styles={{boxSizing:'content-box'}}><Tag text="Tag"/></TagBlock></ThemeProvider>;
// @ts-expect-error Unsupported Buttons variants remain rejected.
const invalid=<Buttons variant="wrong"><Button>Bad</Button></Buttons>;
void valid; void invalid;
