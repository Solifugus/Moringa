# Moringa

Moringa is a chatbot engine intended as the foundation for chatbot functionality in other software projects.  Unlike most other chatbot engines, Moringa is capable of deductive reasoning.  Furthermore, Moringa uses a rich variety of heuristics and interactive capabilities far beyond ordinary chatbot engines.

Features include (but are not limited to):

* Rich Heuristic Interpretation
* Interpretation from Among Cascading Contexts
* Reasoned Deduction
* Sequence Abstraction
* Seeking/Avoiding Conditions
* Contemplations

# Description

## Moringa Agent Script Reference

A Moringa Script comprises directives and action commands.  The directives are generally structural in nature while the action commands are mostly intended for defining reactions.  The basic structure allows for specification of initial memory items, conjugations, synonyms, and re-usable sequences of action commands.

## Memories Directive.  In Moringa, memory is just an array of strings.  The Remember action command may be used to compose new memories.  The Recall action command may be used to read memories, based on pattern searches.  However, you may set initial memories using the following Memory directive early in the script:

```
Memories
       "good is a feeling"
       "good is positive"
       "ok is a feeling"
       "bad is a feeling"
       "bad is negative"
```

## Conjugate Directive.  A conjugation is where text has its form reversed from second-person to first-person.  This is used in changing user input to a form that may be directed back to the user, in an output pattern.  For example, if the user statement was "I am a good fellow.", it may be conjugated back in the form "You are a good follow.".  The following are examples of English language conjugations:

```
Conjugate "are" And "am"
  Conjugate "were" And "was"
  Conjugate "I" And "you"
  Conjugate "me" And "you"
  Conjugate "my" And "your"
  Conjugate "mine" And "yours"
  Conjugate "I'm" To "you are"
  Conjugate "you're" To "I am"
  Conjugate "I've" To "you have"
  Conjugate "you've" To "I have"
  Conjugate "I'll" To "you will"
  Conjugate "you'll" To "I will"
  Conjugate "myself" And "yourself"
  Conjugate "they" And "we"
  Conjugate "them" And "us"
```

## Synonym Command.  Synonyms are often context dependent and so might be defined differently in different contexts within an agent script.  The following illustrates a couple of the most generically applicable synonyms, therefore probably desirable in the global context.

```
Synonym yes: yep, yeah, sure
Synonym no: nope, nah
```
After specification of the above synonyms (for example), any user input with the word "yeah" will be interpreted the same as if it were "yes".

## Sequences Directive.  A sequence is just a way of referencing a re-usable list of action commands.  For example,

```
Sequence "poem"
      say "Roses are red."
      say "Violets are blue."
      say "I can sequence things."
      say "Better than you knew."
```
Later, you can execute this sequence using the Do command, as shown here:

```
Do "poem"
```

## Recognizer Directive

A Recognizer is where you specify an input pattern to match statements a user might make.  Reactions to the statement should be specified after each respective recognizer.  A short description above each example below explains what it illustrates.

```
-- Simple response to the user saying "Hello", or such.
Recognizer "hello"
  Say "Hi. Nice to meet you."
  
-- Response to use saying either "A jedi am I" or "I am a jedi".  Grammar fragments may change positions.
Recognizer "a jedi","am i"
  Say "May the force be with you"
  
-- Response collects two variables from the user's statement and uses them in composing a reply.
Recognizer "I like to [somethingdone] at [aplace]"
  Say "Does everyone at [aplace] like to [somethingdone]?"
  
-- This recognizer matches if the user claims to fix any of three kinds of things
Recognizer "i fix [item:cars,computers,vacuum cleaners]"
  Say "Great!  I was looking for someone who could fix my [item]."
```

## Reactions.

Following a Recognizer, you may directly add action commands and/or put conditions and/or make them optional.  The following illustrates with comments for each illustration.

```
-- The recognizer
Recognizer "how can i skin a cat"
  Remember "user is cruel"  -- always do this (adds to memory)
  -- always do this, if the contidion is true (depends on what's in memory).
  Always If Not "user is joking" And "user is unknown":
    Say "I hope you are joking."
  -- consider this as an optional response..
  Option If "user is joking":
    Say "You could use do it yourself."
  -- consider this as an optional response..
  Option If "user is joking":
    Say "You could hire someone to do it."
  Open
    Say "You don't.  You love and pet your cat."
```

## Context Directive.

The Context directive may be used to group Recognizers and other things.  Outside of a Context directive (before the first Context directive is specifie) is the general context.  For each user statement, any active contexts will be searched for a match before the general context.  Also, the order of contexts searched is from most to least recent referenced.  

The Enter command activates a context and the Exit command deactives it.  Either an activation or a match within is referencing the context.  In this way, interpretation cascades through them falling finally on the general context.

## General List of Action Commands

Below are a number of examples with explanatory comments to help get the gist of what may be done.

```
  Remember "my favoriate food is [food]"
  Recall "my favorite food is [favorite]
  Say "I especially like to eat [favorite]."
  Say "Time to go to work!!" At "6:30 AM"
  Say "Time for a break!" In "15 Minutes"
  Recall "my pizze is in the oven" In "20 Minutes"
  Forget "I am tired of talking about politics" In "3 Hours 20 Minutes"
  Expect "yes" As "I will marry you."  -- if next user statement is "yes", response as if it was "I will marry you."
  Interpret As "I am tired" -- behave as if that is what user said and contine to next action command
  Imagine "You are a doctor" As "a doctor" -- creates fantasy scenario of agent being a doctor
  Say "Am I sick?" To "me as a doctor" -- imagines asking fantasy copy of self this question..
  Unimagine "a doctor"
  Seek 25 % "i am happy"  -- choose options that could lead to this memory being added, priority 25% compared to other seekers
  Avoid 50 % "i am sad"  -- the inverse of above..
```


