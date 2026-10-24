# Superseded fixture observations

The three superseded logs record early fixture checks, not candidate source fixes. Production source stayed at fb46c2103 throughout.

- The first nested-dialog sampler assumed Escape would close both dialogs; the test was corrected to observe and compare the actual remaining titles. Final evidence shows the parent remains open in both arms.
- The composition sampler assumed pointer leave plus dialog focus would immediately remove its tooltip. Final diagnostics preserve the observed mounted tooltip separately; parent-unmount cleanup and standalone dismissal are asserted.
- The initial tooltip disabled-state sampler read the DOM before React committed new props. The final fixture waits for its rendered configuration before making that assertion.

The final complete matrix supersedes these partial runs and retains the inherited observations explicitly. None of these logs is presented as desired-behavior acceptance.
