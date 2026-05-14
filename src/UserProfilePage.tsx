import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardStack,
  Field,
  IconArrowBackIosNew20,
  IconDelete20,
  IconUpload20,
  Input,
  Link,
  MultiSelect,
  Select,
  UserThumbnail,
} from '@lightspeed/unified-components-helios-theme/react'

/** Matches `UserRow` in UsersPage (duplicated here to avoid circular imports). */
export type UserProfileUser = {
  id: string
  name: string
  subtitle: string
  apps: string
  accountAccess: string
  lastActive: string
  enabled: boolean
}

export type ProfileAccessKey = 'staff' | 'site_lead' | 'area_lead' | 'admin' | 'owner'

export type WizardAppId = 'retail' | 'ecom' | 'wholesale'

export type ProfileAppRow = {
  id: WizardAppId
  shop: string
  productLine: string
  assigned: boolean
  role: string
  locations: string[]
}

export type UserProfileDetail = {
  firstName: string
  lastName: string
  email: string
  summarySecondary: string
  accessKey: ProfileAccessKey
  apps: ProfileAppRow[]
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

const ECOM_ROLE_OPTIONS_WITH_MARKETING = [
  ...ECOM_ROLE_OPTIONS,
  { value: 'marketing', label: 'Marketing' },
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

function roleOptionsForApp(appId: WizardAppId, includeEcomMarketing: boolean) {
  if (appId === 'retail') return RETAIL_ROLE_OPTIONS
  if (appId === 'ecom') return includeEcomMarketing ? ECOM_ROLE_OPTIONS_WITH_MARKETING : ECOM_ROLE_OPTIONS
  return WHOLESALE_ROLE_OPTIONS
}

const PROFILE_ACCESS_OPTIONS: {
  value: ProfileAccessKey
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
        'Can add, update, and delete Staff based on their assigned apps, roles, and locations below.',
    },
    {
      value: 'area_lead',
      title: 'Area lead',
      description:
        'Can add, update, and delete Site leads and Staff based on their assigned apps and roles in any location below.',
    },
    {
      value: 'admin',
      title: 'Admin',
      description:
        'Can add, update, and delete Admins, Area leads, Site leads and Staff and assign any app, role, and location below.',
    },
    {
      value: 'owner',
      title: 'Owner',
      description:
        'Full account control including billing, user management, and all products linked to this account.',
    },
  ]

const PROFILE_BY_USER_ID: Record<string, UserProfileDetail> = {
  '1': {
    firstName: 'Brandon',
    lastName: 'Rogers',
    email: 'brandon.rodgers@continental.com',
    summarySecondary: 'brandon.rodgers@continental.com',
    accessKey: 'admin',
    apps: [
      {
        id: 'retail',
        shop: 'The Continental',
        productLine: 'Retail (X-Series)',
        assigned: true,
        role: 'admin',
        locations: ['ponsonby', 'new_market'],
      },
      {
        id: 'ecom',
        shop: 'www.thecontinental.com',
        productLine: 'eCom (E-Series)',
        assigned: true,
        role: 'admin',
        locations: [],
      },
      {
        id: 'wholesale',
        shop: 'The Continental',
        productLine: 'Wholesale',
        assigned: true,
        role: 'admin',
        locations: [],
      },
    ],
  },
  '2': {
    firstName: 'Dixie',
    lastName: 'Matrix',
    email: 'dmatrix@continental.com',
    summarySecondary: 'DMatrix01',
    accessKey: 'site_lead',
    apps: [
      {
        id: 'retail',
        shop: 'The Continental',
        productLine: 'Retail (X-Series)',
        assigned: true,
        role: 'manager',
        locations: ['albany'],
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
        assigned: true,
        role: 'buyer',
        locations: [],
      },
    ],
  },
  '3': {
    firstName: 'Jenna',
    lastName: 'Kahn',
    email: 'jkahn@continental.com',
    summarySecondary: 'JKahn01',
    accessKey: 'staff',
    apps: [
      {
        id: 'retail',
        shop: 'The Continental',
        productLine: 'Retail (X-Series)',
        assigned: true,
        role: 'cashier',
        locations: ['ponsonby'],
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
    ],
  },
  '4': {
    firstName: 'John',
    lastName: 'Wickershire',
    email: 'john.wick@continental.com',
    summarySecondary: 'john.wick@continental.com',
    accessKey: 'owner',
    apps: [
      {
        id: 'retail',
        shop: 'The Continental',
        productLine: 'Retail (X-Series)',
        assigned: true,
        role: 'cashier',
        locations: ['ponsonby'],
      },
      {
        id: 'ecom',
        shop: 'www.thecontinental.com',
        productLine: 'eCom (E-Series)',
        assigned: true,
        role: 'marketing',
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
    ],
  },
  '5': {
    firstName: 'Sarah',
    lastName: 'Turner',
    email: 'sarah.turner@continental.com',
    summarySecondary: 'sarah.turner@continental.com',
    accessKey: 'area_lead',
    apps: [
      {
        id: 'retail',
        shop: 'The Continental',
        productLine: 'Retail (X-Series)',
        assigned: true,
        role: 'manager',
        locations: ['new_market', 'albany'],
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
        assigned: true,
        role: 'buyer',
        locations: [],
      },
    ],
  },
}

function mapListAccessToKey(accountAccess: string): ProfileAccessKey {
  const s = accountAccess.trim().toLowerCase()
  if (s === 'staff') return 'staff'
  if (s === 'site lead') return 'site_lead'
  if (s.includes('area')) return 'area_lead'
  if (s === 'admin') return 'admin'
  if (s === 'owner') return 'owner'
  return 'staff'
}

function parseAppsFromList(appsCsv: string): WizardAppId[] {
  const parts = appsCsv.split(',').map((p) => p.trim().toLowerCase())
  const out: WizardAppId[] = []
  if (parts.some((p) => p.includes('retail'))) out.push('retail')
  if (parts.some((p) => p.includes('ecom'))) out.push('ecom')
  if (parts.some((p) => p.includes('wholesale'))) out.push('wholesale')
  return out
}

export function profileDetailForUser(user: UserProfileUser): UserProfileDetail {
  const preset = PROFILE_BY_USER_ID[user.id]
  if (preset) return preset

  const [firstName = user.name, ...rest] = user.name.split(' ')
  const lastName = rest.join(' ') || ''
  const accessKey = mapListAccessToKey(user.accountAccess)
  const enabledIds = parseAppsFromList(user.apps)
  const templates: ProfileAppRow[] = [
    {
      id: 'retail',
      shop: 'The Continental',
      productLine: 'Retail (X-Series)',
      assigned: enabledIds.includes('retail'),
      role: enabledIds.includes('retail') ? 'cashier' : '',
      locations: enabledIds.includes('retail') ? ['ponsonby'] : [],
    },
    {
      id: 'ecom',
      shop: 'www.thecontinental.com',
      productLine: 'eCom (E-Series)',
      assigned: enabledIds.includes('ecom'),
      role: enabledIds.includes('ecom') ? 'designer' : '',
      locations: [],
    },
    {
      id: 'wholesale',
      shop: 'The Continental',
      productLine: 'Wholesale',
      assigned: enabledIds.includes('wholesale'),
      role: enabledIds.includes('wholesale') ? 'buyer' : '',
      locations: [],
    },
  ]
  return {
    firstName,
    lastName,
    email: user.subtitle.includes('@') ? user.subtitle : `${user.subtitle.toLowerCase()}@continental.com`,
    summarySecondary: user.subtitle,
    accessKey,
    apps: templates,
  }
}

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

export type UserProfilePageProps = {
  user: UserProfileUser
  onBack: () => void
}

export function UserProfilePage({ user, onBack }: UserProfilePageProps) {
  const seed = useMemo(() => profileDetailForUser(user), [user])

  const [firstName, setFirstName] = useState(seed.firstName)
  const [lastName, setLastName] = useState(seed.lastName)
  const [email, setEmail] = useState(seed.email)
  const [accessKey, setAccessKey] = useState<ProfileAccessKey>(seed.accessKey)
  const [apps, setApps] = useState<ProfileAppRow[]>(() =>
    seed.apps.map((a) => ({ ...a, locations: [...a.locations] })),
  )

  const fullName = `${firstName} ${lastName}`.trim() || user.name
  const includeEcomMarketing = user.id === '4'

  const accessHeadingId = 'user-profile-access-heading'

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-10 px-4 pb-12 font-general sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="relative flex min-h-11 max-w-[640px] flex-col gap-1">
          <div className="relative flex min-h-11 items-center">
            <Button
              type="button"
              appearance="ghost"
              size="medium"
              onClick={onBack}
              aria-label="Back to users"
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
            <h1 className="text-heading-8 text-neutral-default">{fullName}</h1>
          </div>
          <p className="typography-body-md text-neutral-default">
            Manage users across all your products
          </p>
        </div>
        <Button
          type="button"
          appearance="primary"
          size="medium"
          onClick={onBack}
          customClasses={{ container: ['shrink-0', 'self-start'] }}
        >
          Save
        </Button>
      </div>

      <section className="flex flex-col gap-6 sm:flex-row sm:gap-10">
        <div className="flex w-full shrink-0 flex-col gap-1.5 sm:max-w-[320px]">
          <h2 className="text-heading-6 text-neutral-default">Details</h2>
          <p className="typography-body-sm text-neutral-default">Personal and contact information.</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Card appearance="neutral" size="medium">
            <div className="flex flex-wrap items-center gap-4">
              <UserThumbnail size="large" userName={fullName} />
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="typography-body-md-emphasized text-neutral-default">{fullName}</p>
                <p className="typography-body-sm text-neutral-default">{seed.summarySecondary}</p>
              </div>
            </div>
          </Card>
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
          <Field labelSlot="Email address" required size="medium">
            <Input
              size="medium"
              value={email}
              onChange={setEmail}
              autocomplete="email"
            />
          </Field>
          <div className="flex flex-col gap-2">
            <p className="typography-body-md-emphasized text-neutral-default">Profile picture</p>
            <Button
              type="button"
              appearance="secondary"
              size="medium"
              prefixSlot={<IconUpload20 aria-hidden />}
              onClick={() => undefined}
            >
              Upload photo
            </Button>
          </div>

        </div>
      </section>

      <hr className="border-0 border-t border-neutral-soft" />

      <section className="flex flex-col gap-6 sm:flex-row sm:gap-10">
        <div className="flex w-full shrink-0 flex-col gap-1.5 sm:max-w-[320px]">
          <h2 className="text-heading-6 text-neutral-default">User Roles</h2>
          <p className="typography-body-sm text-neutral-default">
            Controls what this user can manage across your, and their Lightspeed account.{' '}
            <Link
              href="https://design.lightspeedhq.com"
              target="_blank"
              rel="noreferrer"
              appearance="primary"
              size="small"
            >
              Learn more
            </Link>
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div role="radiogroup" aria-labelledby={accessHeadingId} className="w-full">
            <span id={accessHeadingId} className="sr-only">
              Account access
            </span>
            <CardStack customClasses={{ container: ['w-full'] }}>
              {PROFILE_ACCESS_OPTIONS.map((opt) => (
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
                  <label htmlFor={`user-profile-access-${opt.value}`} className="flex cursor-pointer flex-col gap-1">
                    <input
                      id={`user-profile-access-${opt.value}`}
                      type="radio"
                      name="user-profile-account-access"
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
        </div>
      </section>

      <hr className="border-0 border-t border-neutral-soft" />

      <section className="flex flex-col gap-6 sm:flex-row sm:gap-10">
        <div className="flex w-full shrink-0 flex-col gap-1.5 sm:max-w-[320px]">
          <h2 className="text-heading-6 text-neutral-default">Apps</h2>
          <p className="typography-body-sm text-neutral-default">
            Manage user access to available Lightspeed products.
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <CardStack customClasses={{ container: ['w-full'] }}>
            {apps.map((app) => (
              <Card
                key={app.id}
                appearance="neutral"
                size="medium"
                customClasses={{
                  container: [...APP_ROW_CARD_CLASSES.container],
                  content: [...APP_ROW_CARD_CLASSES.content],
                }}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="size-11 shrink-0 rounded-lg bg-neutral-backdrop" aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="typography-body-sm-emphasized text-neutral-default">{app.shop}</p>
                    <p className="typography-body-xs text-neutral-default">{app.productLine}</p>
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
                            a.id === app.id ? { ...a, assigned: true, role: '', locations: [] } : a,
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
                          options={[...roleOptionsForApp(app.id, includeEcomMarketing)]}
                          value={app.role === '' ? undefined : app.role}
                          onChange={(opt) =>
                            setApps((prev) =>
                              prev.map((a) =>
                                a.id === app.id ? { ...a, role: opt?.value ?? '' } : a,
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
                            id={`user-profile-app-${app.id}-locations`}
                            size="medium"
                            options={RETAIL_LOCATION_OPTIONS_SECTION}
                            value={app.locations}
                            placeholder="Select locations"
                            onChange={(vals) =>
                              setApps((prev) =>
                                prev.map((a) => (a.id === app.id ? { ...a, locations: vals } : a)),
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
        </div>
      </section>

      <hr className="border-0 border-t border-neutral-soft" />

      <section className="flex flex-col gap-6 sm:flex-row sm:gap-10">
        <div className="flex w-full shrink-0 flex-col gap-1.5 sm:max-w-[320px]">
          <h2 className="text-heading-6 text-neutral-default">Security</h2>
          <p className="typography-body-sm text-neutral-default">
            Use a secure password to make sure your account stays safe.
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start justify-end">
          <Button type="button" appearance="secondary" size="medium" onClick={() => undefined}>
            Change password
          </Button>
        </div>
      </section>

      <hr className="border-0 border-t border-neutral-soft" />

      <div>
        <Button
          type="button"
          appearance="danger"
          size="medium"
          prefixSlot={<IconDelete20 aria-hidden />}
          onClick={() => undefined}
        >
          Delete user
        </Button>
      </div>
    </div>
  )
}
