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
  MultiSelect,
  Select,
  SegmentedControlGroup,
  SegmentedControlItem,
  StepItem,
  StepList,
  Steps,
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

type AppId = 'retail' | 'ecom' | 'wholesale'

type AppRow = {
  id: AppId
  shop: string
  productLine: string
  assigned: boolean
  role: string
  /** Retail only; ignored for eCom and Wholesale */
  locations: string[]
}

function createDefaultApps(): AppRow[] {
  return [
    {
      id: 'retail',
      shop: 'The Continental',
      productLine: 'Retail (X-Series)',
      assigned: false,
      role: '',
      locations: [],
    },
    {
      id: 'ecom',
      shop: 'www.thecontinental.com',
      productLine: 'eCom (E-Series)',
      assigned: false,
      role: '',
      locations: [],
    },
    {
      id: 'wholesale',
      shop: 'The Continental',
      productLine: 'Wholesale',
      assigned: false,
      role: '',
      locations: [],
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

const RETAIL_ROLE_OPTIONS = [
  { value: 'cashier', label: 'Cashier' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
] as const

const ECOM_ROLE_OPTIONS = [
  { value: 'designer', label: 'Designer' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
] as const

const WHOLESALE_ROLE_OPTIONS = [
  { value: 'pos_only', label: 'POS Only' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'admin', label: 'Admin' },
] as const

const RETAIL_LOCATION_OPTIONS = [
  { value: 'ponsonby', label: 'Ponsonby' },
  { value: 'new_market', label: 'New Market' },
  { value: 'albany', label: 'Albany' },
] as const

const RETAIL_LOCATION_OPTIONS_SECTION = [{ items: [...RETAIL_LOCATION_OPTIONS] }]

function roleOptionsForApp(appId: AppId) {
  if (appId === 'retail') return RETAIL_ROLE_OPTIONS
  if (appId === 'ecom') return ECOM_ROLE_OPTIONS
  return WHOLESALE_ROLE_OPTIONS
}

function roleLabelFor(appId: AppId, role: string): string {
  const opts = roleOptionsForApp(appId)
  return opts.find((o) => o.value === role)?.label ?? role
}

function retailLocationLabels(values: string[]): string {
  return values
    .map((v) => RETAIL_LOCATION_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .join(', ')
}

function isAssignedAppConfigured(app: AppRow): boolean {
  if (!app.role.trim()) return false
  if (app.id === 'retail') return app.locations.length > 0
  return true
}

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
  const [profileSaveAttempted, setProfileSaveAttempted] = useState(false)

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
    setProfileSaveAttempted(false)
  }

  const handleHeaderBack = () => {
    if (step === 'profile') {
      setProfileSaveAttempted(false)
      setStep('access')
    } else onClose()
  }

  const assignedApps = apps.filter((a) => a.assigned)

  const accessStepCanContinue =
    assignedApps.length > 0 && assignedApps.every(isAssignedAppConfigured)

  const profileFirstNameInvalid = profileSaveAttempted && firstName.trim() === ''
  const profileEmailInvalid = profileSaveAttempted && accountMode === 'invite' && email.trim() === ''
  const profileUsernameInvalid =
    profileSaveAttempted && accountMode === 'credentials' && username.trim() === ''

  const handleSaveUser = () => {
    const hasFirstName = firstName.trim() !== ''
    const hasContact =
      accountMode === 'invite' ? email.trim() !== '' : username.trim() !== ''
    if (!hasFirstName || !hasContact) {
      setProfileSaveAttempted(true)
      return
    }
    setProfileSaveAttempted(false)
    setStep('success')
  }

  const wizardStepIndex = step === 'access' ? 0 : step === 'profile' ? 1 : 2

  const handleStepsStepChange = (index: number) => {
    if (index === 0) {
      setProfileSaveAttempted(false)
      setStep('access')
    } else if (index === 1) {
      setProfileSaveAttempted(false)
      setStep('profile')
    } else setStep('success')
  }

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
        <div className="relative flex flex-col gap-8">
          {step !== 'success' && (
            <div className="relative flex min-h-11 items-center">
              <Button
                type="button"
                appearance="ghost"
                size="medium"
                onClick={handleHeaderBack}
                aria-label="Back"
                customClasses={{
                  container: [
                    'absolute',
                    'right-full',
                    'top-1/2',
                    '-translate-y-1/2',
                    'mr-2',
                    'shrink-0',
                  ],
                }}
              >
                <IconArrowBackIosNew20 aria-hidden />
              </Button>
              <h1 className="text-heading-8 text-neutral-default">Add user</h1>
            </div>
          )}

          <Steps
            id="add-user-wizard-steps"
            count={3}
            step={wizardStepIndex}
            orientation="horizontal"
            onStepChange={handleStepsStepChange}
          >
            <StepList>
              <StepItem index={0} labelSlot="Account and product access" />
              <StepItem index={1} labelSlot="Setup user" />
              <StepItem index={2} labelSlot="User added" />
            </StepList>
          </Steps>

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
                className="flex flex-col gap-8"
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
                                    ? { ...a, assigned: false, role: '', locations: [] }
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
                                    ? { ...a, assigned: true, role: '', locations: [] }
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
                                placeholder="Select role"
                                options={[...roleOptionsForApp(app.id)]}
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
                          {app.id === 'retail' ? (
                            <div className="min-w-[200px] flex-1">
                              <Field labelSlot="Location" required size="medium">
                                <MultiSelect
                                  id={`add-user-app-${app.id}-locations`}
                                  size="medium"
                                  options={RETAIL_LOCATION_OPTIONS_SECTION}
                                  value={app.locations}
                                  placeholder="Select locations"
                                  onChange={(vals) =>
                                    setApps((prev) =>
                                      prev.map((a) =>
                                        a.id === app.id ? { ...a, locations: vals } : a,
                                      ),
                                    )
                                  }
                                />
                              </Field>
                            </div>
                          ) : null}
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
                  onClick={() => {
                    setProfileSaveAttempted(false)
                    setStep('profile')
                  }}
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
                    <Field
                      labelSlot="First name"
                      required
                      size="medium"
                      invalid={profileFirstNameInvalid}
                      errorMessageSlot={
                        profileFirstNameInvalid ? 'Enter a first name.' : undefined
                      }
                    >
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
                      setProfileSaveAttempted(false)
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
                    <Field
                      labelSlot="Email"
                      required
                      size="medium"
                      invalid={profileEmailInvalid}
                      errorMessageSlot={
                        profileEmailInvalid ? 'Enter an email address.' : undefined
                      }
                    >
                      <Input
                        size="medium"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        autocomplete="email"
                        suffixSlot={
                          email.trim() !== '' && !profileEmailInvalid ? (
                            <IconCheckCircle20 className="text-go-default" aria-hidden />
                          ) : undefined
                        }
                      />
                    </Field>
                  )}

                  {accountMode === 'credentials' && (
                    <div className="flex w-full flex-col gap-6">
                      <Field
                        labelSlot="Username"
                        required
                        size="medium"
                        invalid={profileUsernameInvalid}
                        errorMessageSlot={
                          profileUsernameInvalid ? 'Enter a username.' : undefined
                        }
                      >
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
                  onClick={handleSaveUser}
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
              >
                <MediaLeftBlockLayout
                  size="large"
                  appearance="default"
                  mediaSlot={<UserThumbnail size="large" userName={fullName || 'User'} />}
                  titleSlot={fullName || 'User'}
                >
                  <div className="flex flex-col gap-1 typography-body-sm text-neutral-default">
                    {accountMode === 'invite' ? (
                      <span>{email}</span>
                    ) : (
                      <span>{username}</span>
                    )}
                    <span>{ACCESS_TITLE[accessKey]}</span>
                  </div>
                </MediaLeftBlockLayout>
              </Card>

              <div
                className="flex flex-col gap-4"
                aria-labelledby="add-user-success-assigned-apps-heading"
              >
                <h3 id="add-user-success-assigned-apps-heading" className="text-heading-6 text-neutral-default">
                  Assigned apps
                </h3>
                <div className="flex w-full flex-col gap-4">
                  {assignedApps.map((app) => (
                    <Card
                      key={app.id}
                      id={`add-user-app-success-${app.id}`}
                      appearance="neutral"
                      size="medium"
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
                            {roleLabelFor(app.id, app.role)}
                          </p>
                        </div>
                        {app.id === 'retail' ? (
                          <div>
                            <p className="typography-body-md-emphasized text-neutral-default">Locations</p>
                            <p className="typography-body-sm text-neutral-default">
                              {retailLocationLabels(app.locations)}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex w-full flex-row gap-4">
                <Button
                  type="button"
                  appearance="secondary"
                  size="medium"
                  onClick={resetWizard}
                  customClasses={{ container: ['min-w-0', 'w-full', 'flex-1', 'basis-0'] }}
                >
                  Add another user
                </Button>
                <Button
                  type="button"
                  appearance="primary"
                  size="medium"
                  onClick={onClose}
                  customClasses={{ container: ['min-w-0', 'w-full', 'flex-1', 'basis-0'] }}
                >
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
