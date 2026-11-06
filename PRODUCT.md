# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Busy Bee serves a mixed audience of mobile users who need lightweight focus support and task triage during the day. The primary usage context is a Telegram-first mobile workflow where the user wants to quickly review priorities, start a focus session, and keep moving without friction.

## Product Purpose

Busy Bee combines focus timing and task prioritization in one compact mobile experience. It helps users decide what matters now, start a Pomodoro session quickly, and manage their tasks without switching between separate timer and todo tools.

## Positioning

The product's distinct value is that it pairs a Pomodoro timer with Eisenhower-style task prioritization inside a Telegram-first mobile app. It is not only a timer and not only a task list; it makes prioritization and focused execution feel like one continuous workflow.

## Operating Context

Users open the app in Telegram on mobile for short, repeated sessions. They review tasks through importance quadrants, move tasks between those quadrants, and use the timer to commit to focused work blocks. The app should stay fast, calm, legible, and low-friction in a handheld context.

## Capabilities and Constraints

- Uses Supabase for auth and task persistence.
- Preserves the Pomodoro timer as a core feature, but its interface may be redesigned.
- Preserves the Eisenhower-style quadrant model as an essential task-management feature.
- Prioritizes Telegram-first mobile usage over larger-screen layouts.
- Should avoid becoming a heavier, more complex multi-screen productivity product unless the user later changes scope.

## Brand Commitments

- Product name: Busy Bee.
- The redesign direction should feel calm, premium, and tightened rather than loud or playful.
- The user prefers a balanced color system informed by a 60-30-10 ratio.

## Evidence on Hand

- Existing Vite/React/TypeScript codebase.
- Existing timer, dashboard, and todo interfaces in `src/`.
- Existing Supabase-backed task model and Telegram Web App integration.
- No additional brand guidelines, illustrations, or marketing assets have been provided.

## Product Principles

- Make the next action obvious within seconds on mobile.
- Keep focus timing and prioritization connected in one flow.
- Reduce friction before adding capability.
- Preserve calm and clarity under frequent daily use.
- Let structure, not decoration, carry the interface.
