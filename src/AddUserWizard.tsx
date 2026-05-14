import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardStack,
  Field,
  IconArrowBackIosNew20,
  IconCheckCircle20,
  IconUpload20,
  Input,
  Link,
  MediaLeftBlockLayout,
  Select,
  SegmentedControlGroup,
  SegmentedControlItem,
  UserThumbnail,
} from '@lightspeed/unified-components-helios-theme/react'

export type AddUserWizardProps = {
  onClose: () => void
}

type WizardStep = 'access' | 'profile' | 'success'

type AccessKey = 'staff' | 'site_lead' | 'area_lead' | 'admin'

const ACCESS_OPTIONS: {
  value: AccessKey
  title: string
  description: string
  defaultBadge?: boolean
}[] = [
  {
    value: 'staff',
    title: 'Staff',
    description: 'Can update their profile details and password.',
    defaultBadge: true,
  },
  {
    value: 'site_lead',
    title: 'Site lead',
    description:
      'Can manage other Staff with the same assigned apps, roles, and locations.',
  },
  {
    value: 'area_lead',
    title: 'Area lead',
    description:
      'Can manage other Site leads and Staff with the same assigned apps and roles in any location.',
  },
  {
    value: 'admin',
    title: 'Admin',
    description:
      'Can manage other Admins, Area leads, Site leads and Staff and manage any app, role, and location.',
  },
]

const ACCESS_TITLE: Record<AccessKey, string> = {
  staff: 'Staff',
  site_lead: 'Site lead',
  area_lead: 'Area lead',
  admin: 'Admin',
}

type AppRow = {
  id: string
  shop: string
  productLine: string
  assigned: boolean
  role: string
  location: string
}

function createDefaultApps(): AppRow[] {
  return [
    {
      id: 'retail',
      shop: 'The Continental',
      productLine: 'Retail (X-Series)',
      assigned: false,
      role: '',
      location: '',
    },
    {
      id: 'ecom',
      shop: 'The Continental',
      productLine: 'eCom (E-Series)',
      assigned: false,
      role: '',
      location: '',
    },
    {
      id: 'wholesale',
      shop: 'The Continental',
      productLine: 'Wholesale',
      assigned: false,
      role: '',
      location: '',
    },
  ]
}

function usernameShowsValidIndicator(value: string): boolean {
  const t = value.trim()
  return /^[a-zA-Z0-9._-]{3,}$/.test(t)
}

function generateTemporaryPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%&*'
  const all = upper + lower + digits + symbols
  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)]!
  const out: string[] = [pick(upper), pick(lower), pick(digits), pick(symbols)]
  const targetLen = 14
  while (out.length < targetLen) out.push(pick(all))
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out.join('')
}

const ROLE_OPTIONS = [
  { value: 'cashier', label: 'Cashier' },
  { value: 'manager', label: 'Manager' },
  { value: 'buyer', label: 'Buyer' },
]

const LOCATION_OPTIONS = [
  { value: 'ponsonby', label: 'Ponsonby' },
  { value: 'New Market', label: 'New Market' },
  { value: 'Albany', label: 'Albany' },
]

/** Each app row is a Helios `Card`; padding lives on `content` so children stay in `data-part="content"`. */
const APP_ROW_CARD_CLASSES = {
  container: ['w-full', 'min-h-0', 'p-0', 'gap-0', 'shadow-none'],
  content: [
    'mr-0',
    'flex',
    'w-full',
    'min-w-0',
    'flex-col',
    'gap-4',
    'p-6',
    'text-left',
    'typography-body-sm',
  ],
} as const

export function AddUserWizard({ onClose }: AddUserWizardProps) {
  const [step, setStep] = useState<WizardStep>('access')
  const [accessKey, setAccessKey] = useState<AccessKey>('staff')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [accountMode, setAccountMode] = useState<'invite' | 'credentials'>('invite')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [apps, setApps] = useState<AppRow[]>(() => createDefaultApps())

  const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName])

  const resetWizard = () => {
    setStep('access')
    setAccessKey('staff')
    setFirstName('')
    setLastName('')
    setEmail('')
    setAccountMode('invite')
    setUsername('')
    setPassword('')
    setApps(createDefaultApps())
  }

  const handleHeaderBack = () => {
    if (step === 'profile') setStep('access')
    else onClose()
  }

  const assignedApps = apps.filter((a) => a.assigned)

  const accessStepCanContinue =
    assignedApps.length > 0 &&
    assignedApps.every((a) => a.role.trim() !== '' && a.location.trim() !== '')

  return (
    <div
      className="box-border flex min-w-0 w-full flex-col gap-8 px-4 py-8 font-general sm:px-0"
      style={{
        width: 'min(100%, 600px)',
        maxWidth: 600,
        marginInline: 'auto',
      }}
    >
      <div className="flex min-w-0 w-full flex-col gap-8">
        <div className="flex gap-1">
          <span
            className={
              step === 'access'
                ? 'size-2 rounded-full bg-go-default'
                : 'size-2 rounded-full bg-go-soft'
            }
            aria-hidden
          />
          <span
            className={
              step === 'profile' || step === 'success'
                ? 'size-2 rounded-full bg-go-default'
                : 'size-2 rounded-full bg-go-soft/20'
            }
            aria-hidden
          />
        </div>

        <div className="relative flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <Button
              type="button"
              appearance="ghost"
              size="medium"
              onClick={handleHeaderBack}
              aria-label="Back"
              customClasses={{ container: ['shrink-0', '-ml-1'] }}
            >
              <IconArrowBackIosNew20 aria-hidden />
            </Button>
            <h1 className="text-heading-8 text-neutral-default">Add user</h1>
          </div>

          {step === 'access' && (
            <>
              <section className="flex flex-col gap-8">
                <div className="flex flex-col gap-1.5 text-neutral-default">
                  <h2 id="add-user-assign-access-heading" className="text-heading-6">
                    Assign account access
                  </h2>
                  <p className="typography-body-sm">
                    Choose what account access you want to give this user.{' '}
                    <Link
                      href="https://design.lightspeedhq.com"
                      target="_blank"
                      rel="noreferrer"
                      appearance="primary"
                      size="small"
                    >
                      Learn more about account access.
                    </Link>
                  </p>
                </div>

                <div
                  role="radiogroup"
                  aria-labelledby="add-user-assign-access-heading"
                  className="w-full"
                >
                  <CardStack
                    customClasses={{
                      container: ['w-full'],
                    }}
                  >
                    {ACCESS_OPTIONS.map((opt) => (
                      <Card
                        key={opt.value}
                        appearance="neutral"
                        size="medium"
                        customClasses={{
                          container: [
                            'w-full',
                            'min-h-0',
                            'cursor-pointer',
                            'p-0',
                            'gap-0',
                            'shadow-none',
                            'focus-within:outline',
                            'focus-within:outline-2',
                            'focus-within:outline-offset-[-2px]',
                            'focus-within:outline-border-go-default',
                            accessKey === opt.value ? '!border-go-default bg-go-highlight-default' : '',
                          ].filter(Boolean),
                          content: [
                            'mr-0',
                            'flex',
                            'w-full',
                            'flex-col',
                            'gap-1',
                            'p-6',
                            'text-left',
                            'typography-body-sm',
                          ],
                        }}
                      >
                        <label
                          htmlFor={`add-user-access-${opt.value}`}
                          className="flex cursor-pointer flex-col gap-1"
                        >
                          <input
                            id={`add-user-access-${opt.value}`}
                            type="radio"
                            name="add-user-account-access"
                            value={opt.value}
                            checked={accessKey === opt.value}
                            onChange={() => setAccessKey(opt.value)}
                            className="sr-only"
                          />
                          <span className="inline-flex flex-wrap items-center gap-2 typography-body-md-emphasized text-neutral-default">
                            {opt.title}
                            {opt.defaultBadge ? (
                              <Badge appearance="default" size="medium">
                                Default
                              </Badge>
                            ) : null}
                          </span>
                          <span className="typography-body-sm text-neutral-default">{opt.description}</span>
                        </label>
                      </Card>
                    ))}
                  </CardStack>
                </div>
              </section>

              <section
                className="flex flex-col gap-4"
                aria-labelledby="add-user-assign-apps-heading"
              >
                <div className="flex flex-col gap-1.5 text-neutral-default">
                  <h2 id="add-user-assign-apps-heading" className="text-heading-6">
                    Assign and configure apps
                  </h2>
                  <p className="typography-body-sm">
                    Select the apps this user can access and configure their settings for each.
                  </p>
                </div>

                <CardStack
                  customClasses={{
                    container: ['w-full'],
                  }}
                >
                  {apps.map((app) => (
                    <Card
                      key={app.id}
                      id={`add-user-app-${app.id}`}
                      appearance="neutral"
                      size="medium"
                      customClasses={{
                        container: [...APP_ROW_CARD_CLASSES.container],
                        content: [...APP_ROW_CARD_CLASSES.content],
                      }}
                    >
                      <div className="flex flex-wrap items-center gap-4">
                        <div
                          className="size-14 shrink-0 rounded-lg bg-neutral-backdrop"
                          aria-hidden
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <p className="typography-body-md-emphasized text-neutral-default">
                            {app.shop}
                          </p>
                          <p className="typography-body-sm text-neutral-default">{app.productLine}</p>
                        </div>
                        {app.assigned ? (
                          <Button
                            type="button"
                            appearance="danger-ghost"
                            size="medium"
                            onClick={() =>
                              setApps((prev) =>
                                prev.map((a) =>
                                  a.id === app.id
                                    ? { ...a, assigned: false, role: '', location: '' }
                                    : a,
                                ),
                              )
                            }
                            customClasses={{ container: ['shrink-0'] }}
                          >
                            Remove app
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            appearance="ghost-primary"
                            size="medium"
                            onClick={() =>
                              setApps((prev) =>
                                prev.map((a) =>
                                  a.id === app.id
                                    ? { ...a, assigned: true, role: '', location: '' }
                                    : a,
                                ),
                              )
                            }
                            customClasses={{ container: ['shrink-0'] }}
                          >
                            Assign app
                          </Button>
                        )}
                      </div>

                      {app.assigned && (
                        <div className="flex flex-wrap gap-4">
                          <div className="min-w-[200px] flex-1">
                            <Field labelSlot="Role" required size="medium">
                              <Select
                                size="medium"
                                labelLayout="outside"
                                options={ROLE_OPTIONS}
                                value={app.role === '' ? undefined : app.role}
                                onChange={(opt) =>
                                  setApps((prev) =>
                                    prev.map((a) =>
                                      a.id === app.id
                                        ? { ...a, role: opt?.value ?? '' }
                                        : a,
                                    ),
                                  )
                                }
                              />
                            </Field>
                          </div>
                          <div className="min-w-[200px] flex-1">
                            <Field labelSlot="Location" required size="medium">
                              <Select
                                size="medium"
                                labelLayout="outside"
                                options={LOCATION_OPTIONS}
                                value={app.location === '' ? undefined : app.location}
                                onChange={(opt) =>
                                  setApps((prev) =>
                                    prev.map((a) =>
                                      a.id === app.id
                                        ? { ...a, location: opt?.value ?? '' }
                                        : a,
                                    ),
                                  )
                                }
                              />
                            </Field>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </CardStack>
              </section>

              <div className="flex w-full gap-4">
                <Button
                  type="button"
                  appearance="secondary"
                  size="medium"
                  onClick={onClose}
                  customClasses={{ container: ['min-w-0', 'w-full', 'flex-1', 'basis-0'] }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  appearance="primary"
                  size="medium"
                  disabled={!accessStepCanContinue}
                  onClick={() => setStep('profile')}
                  customClasses={{ container: ['min-w-0', 'w-full', 'flex-1', 'basis-0'] }}
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 'profile' && (
            <>
              <section className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5 text-neutral-default">
                  <h2 className="text-heading-6">Setup profile</h2>
                  <p className="typography-body-sm">Enter basic details for this user</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="min-w-[200px] flex-1">
                    <Field labelSlot="First name" required size="medium">
                      <Input
                        size="medium"
                        value={firstName}
                        onChange={setFirstName}
                        autocomplete="given-name"
                      />
                    </Field>
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <Field labelSlot="Last name" size="medium">
                      <Input
                        size="medium"
                        value={lastName}
                        onChange={setLastName}
                        autocomplete="family-name"
                      />
                    </Field>
                  </div>
                </div>

                <Card
                  appearance="neutral"
                  size="medium"
                >
                    <MediaLeftBlockLayout
                      size="large"
                      appearance="default"
                      mediaSlot={<UserThumbnail size="large" userName={fullName || 'User'} />}
                      titleSlot={fullName || 'User name'}
                    >
                      {ACCESS_TITLE[accessKey]}
                    </MediaLeftBlockLayout>
                    <Button
                      type="button"
                      appearance="ghost-primary"
                      size="medium"
                      prefixSlot={<IconUpload20 aria-hidden />}
                      onClick={() => undefined}
                    >
                      Upload profile photo
                    </Button>
                </Card>
              </section>

              <section className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5 text-neutral-default">
                  <h2 className="text-heading-6">Setup account</h2>
                  <p className="typography-body-sm">Invite user or create a username and password.</p>
                </div>

                <div className="flex w-full flex-col gap-6">
                  <SegmentedControlGroup
                    appearance="default"
                    size="default"
                    layout="fill"
                    value={accountMode}
                    onChange={(v) => {
                      const next = (v as 'invite' | 'credentials') ?? 'invite'
                      setAccountMode(next)
                      if (next === 'credentials') {
                        setPassword(generateTemporaryPassword())
                      }
                    }}
                  >
                    <SegmentedControlItem value="invite">Invite with an email</SegmentedControlItem>
                    <SegmentedControlItem value="credentials">
                      Create a username and password
                    </SegmentedControlItem>
                  </SegmentedControlGroup>

                  {accountMode === 'invite' && (
                    <Field labelSlot="Email" required size="medium">
                      <Input
                        size="medium"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        autocomplete="email"
                        suffixSlot={<IconCheckCircle20 className="text-go-default" aria-hidden />}
                      />
                    </Field>
                  )}

                  {accountMode === 'credentials' && (
                    <div className="flex w-full flex-col gap-6">
                      <Field labelSlot="Username" required size="medium">
                        <Input
                          size="medium"
                          value={username}
                          onChange={setUsername}
                          autocomplete="username"
                          suffixSlot={
                            usernameShowsValidIndicator(username) ? (
                              <IconCheckCircle20
                                className="text-go-default"
                                aria-label="Username looks valid"
                              />
                            ) : undefined
                          }
                        />
                      </Field>

                      <div className="flex w-full flex-wrap items-end gap-4">
                        <div className="min-w-0 flex-1 basis-[min(100%,240px)]">
                          <Field
                            labelSlot="Temporary password"
                            descriptionSlot={
                              <span className="typography-body-sm text-neutral-soft">
                                This user will be required to set a new password when they log in.
                              </span>
                            }
                            size="medium"
                          >
                            <Input
                              size="medium"
                              type="text"
                              value={password}
                              onChange={setPassword}
                              autocomplete="off"
                            />
                          </Field>
                        </div>
                        <Button
                          type="button"
                          appearance="secondary"
                          size="medium"
                          onClick={() => setPassword(generateTemporaryPassword())}
                          customClasses={{ container: ['shrink-0'] }}
                        >
                          Generate password
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <div className="flex w-full gap-4">
                <Button
                  type="button"
                  appearance="secondary"
                  size="medium"
                  onClick={() => setStep('access')}
                  customClasses={{ container: ['min-w-0', 'w-full', 'flex-1', 'basis-0'] }}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  appearance="primary"
                  size="medium"
                  onClick={() => setStep('success')}
                  customClasses={{ container: ['min-w-0', 'w-full', 'flex-1', 'basis-0'] }}
                >
                  Save user
                </Button>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-stretch gap-8">
              <div className="flex flex-col items-center gap-1.5 text-center text-neutral-default">
                <span className="text-5xl" aria-hidden>
                  🎉
                </span>
                <h2 className="text-heading-8">{fullName} added</h2>
                <p className="typography-body-md max-w-md">
                  {accountMode === 'invite'
                    ? 'An email invite was sent with instructions to log in and set their password.'
                    : 'Their account is ready. Share their username so they can sign in.'}
                </p>
              </div>

              <Card
                appearance="neutral"
                size="medium"
                customClasses={{
                  container: ['border', 'border-neutral-soft'],
                  content: ['flex', 'flex-col', 'gap-4', 'p-6'],
                }}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <UserThumbnail size="small" userName={fullName} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="typography-body-md-emphasized text-neutral-default">{fullName}</p>
                    {accountMode === 'invite' ? (
                      <p className="typography-body-sm text-neutral-default">{email}</p>
                    ) : (
                      <p className="typography-body-sm text-neutral-default">{username}</p>
                    )}
                    <p className="typography-body-sm text-neutral-default">{ACCESS_TITLE[accessKey]}</p>
                  </div>
                </div>
              </Card>

              <div
                className="flex flex-col gap-4"
                aria-labelledby="add-user-success-assigned-apps-heading"
              >
                <h3 id="add-user-success-assigned-apps-heading" className="text-heading-6 text-neutral-default">
                  Assigned apps
                </h3>
                <CardStack
                  customClasses={{
                    container: ['w-full'],
                  }}
                >
                  {assignedApps.map((app) => (
                    <Card
                      key={app.id}
                      id={`add-user-app-success-${app.id}`}
                      appearance="neutral"
                      size="medium"
                      customClasses={{
                        container: [...APP_ROW_CARD_CLASSES.container],
                        content: [...APP_ROW_CARD_CLASSES.content],
                      }}
                    >
                      <div className="flex flex-wrap items-center gap-4">
                        <div
                          className="size-14 shrink-0 rounded-lg bg-neutral-backdrop"
                          aria-hidden
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <p className="typography-body-md-emphasized text-neutral-default">{app.shop}</p>
                          <p className="typography-body-sm text-neutral-default">{app.productLine}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-6">
                        <div>
                          <p className="typography-body-md-emphasized text-neutral-default">Role</p>
                          <p className="typography-body-sm text-neutral-default">
                            {ROLE_OPTIONS.find((r) => r.value === app.role)?.label ?? app.role}
                          </p>
                        </div>
                        <div>
                          <p className="typography-body-md-emphasized text-neutral-default">Location</p>
                          <p className="typography-body-sm text-neutral-default">
                            {LOCATION_OPTIONS.find((l) => l.value === app.location)?.label ?? app.location}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardStack>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button type="button" appearance="secondary" size="medium" onClick={resetWizard}>
                  Add another user
                </Button>
                <Button type="button" appearance="primary" size="medium" onClick={onClose}>
                  Back to users
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
