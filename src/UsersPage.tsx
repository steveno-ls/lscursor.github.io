import { useMemo, useState } from 'react'
import { AddUserWizard } from './AddUserWizard'
import {
  Button,
  Card,
  CardStack,
  CheckMark,
  DropdownListItem,
  FilterButton,
  FilterList,
  IconMagnifyingGlass20,
  Input,
  MediaLeftActionCardLayout,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  UserItem,
} from '@lightspeed/unified-components-helios-theme/react'

export interface UserRow {
  id: string
  name: string
  subtitle: string
  apps: string
  accountAccess: string
  lastActive: string
  enabled: boolean
}

const USERS: UserRow[] = [
  {
    id: '1',
    name: 'Brandon Rogers',
    subtitle: 'brandon.rodgers@continental.com',
    apps: 'eCom, Retail, Wholesale',
    accountAccess: 'Admin',
    lastActive: 'Today',
    enabled: true,
  },
  {
    id: '2',
    name: 'Dixie Matrix',
    subtitle: 'DMatrix01',
    apps: 'Retail, Wholesale',
    accountAccess: 'Site lead',
    lastActive: '1 week ago',
    enabled: true,
  },
  {
    id: '3',
    name: 'Jenna Kahn',
    subtitle: 'JKahn01',
    apps: 'Retail',
    accountAccess: 'Staff',
    lastActive: '—',
    enabled: true,
  },
  {
    id: '4',
    name: 'John Wickershire',
    subtitle: 'john.wick@continental.com',
    apps: 'eCom, Retail, Wholesale',
    accountAccess: 'Owner',
    lastActive: 'Yesterday',
    enabled: false,
  },
  {
    id: '5',
    name: 'Sarah Turner',
    subtitle: 'sarah.turner@continental.com',
    apps: 'Retail, Wholesale',
    accountAccess: 'Area Lead',
    lastActive: 'Today',
    enabled: true,
  },
]

const APP_FILTER_OPTIONS = [
  { value: 'eCom', label: 'eCom' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Wholesale', label: 'Wholesale' },
]

const ACCESS_FILTER_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Site lead', label: 'Site lead' },
  { value: 'Staff', label: 'Staff' },
  { value: 'Owner', label: 'Owner' },
  { value: 'Area Lead', label: 'Area Lead' },
]

function formatMultiFilterLabel(
  base: string,
  selected: string[],
  options: { value: string; label: string }[],
): string {
  if (selected.length === 0) return base
  if (selected.length === 1) {
    const opt = options.find((o) => o.value === selected[0])
    return `${base}: ${opt?.label ?? selected[0]}`
  }
  return `${base}: multiple`
}

export function UsersPage() {
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [appsFilter, setAppsFilter] = useState<string[]>([])
  const [accessFilter, setAccessFilter] = useState<string[]>([])
  const [enabledById, setEnabledById] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(USERS.map((u) => [u.id, u.enabled])),
  )

  const appsLabel = formatMultiFilterLabel('Apps', appsFilter, APP_FILTER_OPTIONS)
  const accessLabel = formatMultiFilterLabel('Account access', accessFilter, ACCESS_FILTER_OPTIONS)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return USERS.filter((u) => {
      if (q && !u.name.toLowerCase().includes(q) && !u.subtitle.toLowerCase().includes(q)) {
        return false
      }
      if (appsFilter.length > 0 && !appsFilter.some((app) => u.apps.includes(app))) {
        return false
      }
      if (accessFilter.length > 0 && !accessFilter.includes(u.accountAccess)) {
        return false
      }
      return true
    })
  }, [query, appsFilter, accessFilter])

  const tableHeadSlot = (
    <Card
      appearance="neutral"
      size="medium"
      customClasses={{
        container: ['h-full', 'w-full', 'border-0', 'bg-transparent', 'p-0', 'shadow-none'],
        content: ['flex', 'flex-col', 'gap-4', 'p-0'],
      }}
    >
      <Input
        size="medium"
        placeholder="Filter users by name"
        value={query}
        onChange={setQuery}
        prefixSlot={<IconMagnifyingGlass20 aria-hidden />}
        customClasses={{ controlContainer: ['w-full'] }}
      />
      <Card
        appearance="neutral"
        size="medium"
        customClasses={{
          container: ['h-full', 'w-full', 'border-0', 'bg-transparent', 'p-0', 'shadow-none'],
          content: ['flex', 'flex-wrap', 'gap-2', 'p-0'],
        }}
      >
        <FilterButton
          size="small"
          labelSlot={appsLabel}
          displayMode="value"
          clearable
          multiple
          value={appsFilter}
          counterSlot={appsFilter.length > 1 ? `(${appsFilter.length})` : undefined}
          onClear={() => setAppsFilter([])}
          onChange={(value) => {
            if (value == null || (Array.isArray(value) && value.length === 0)) {
              setAppsFilter([])
              return
            }
            setAppsFilter(Array.isArray(value) ? value : [value])
          }}
        >
          <FilterList
            multiple
            showSelectAll
            selectAllLabel="Select all"
            options={APP_FILTER_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            renderItem={({ item, state, props }) => (
              <DropdownListItem
                {...props}
                key={item.value}
                value={item.value}
                highlighted={state.highlighted}
                disabled={state.disabled}
                prefixSlot={
                  <CheckMark checked={state.selected} indeterminate={state.indeterminate} />
                }
              >
                <span className="text-neutral-default">{item.label}</span>
              </DropdownListItem>
            )}
          />
        </FilterButton>
        <FilterButton
          size="small"
          labelSlot={accessLabel}
          displayMode="value"
          clearable
          multiple
          value={accessFilter}
          counterSlot={accessFilter.length > 1 ? `(${accessFilter.length})` : undefined}
          onClear={() => setAccessFilter([])}
          onChange={(value) => {
            if (value == null || (Array.isArray(value) && value.length === 0)) {
              setAccessFilter([])
              return
            }
            setAccessFilter(Array.isArray(value) ? value : [value])
          }}
        >
          <FilterList
            multiple
            showSelectAll
            selectAllLabel="Select all"
            options={ACCESS_FILTER_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            renderItem={({ item, state, props }) => (
              <DropdownListItem
                {...props}
                key={item.value}
                value={item.value}
                highlighted={state.highlighted}
                disabled={state.disabled}
                prefixSlot={
                  <CheckMark checked={state.selected} indeterminate={state.indeterminate} />
                }
              >
                <span className="text-neutral-default">{item.label}</span>
              </DropdownListItem>
            )}
          />
        </FilterButton>
      </Card>
    </Card>
  )

  if (addUserOpen) {
    return (
      <div className="flex w-full justify-center">
        <AddUserWizard onClose={() => setAddUserOpen(false)} />
      </div>
    )
  }

  return (
    <CardStack
      customClasses={{
        container: ['mx-auto', 'flex', 'w-full', 'max-w-[1100px]', 'flex-col', 'gap-6'],
      }}
    >
      <MediaLeftActionCardLayout
        size="medium"
        appearance="default"
        actionsPosition="right"
        titleSlot="Users"
        subtitleSlot="Manage users across your account and all Lightspeed apps."
        customClasses={{
          root: ['!border-b-0'],
          title: ['text-heading-8', 'text-neutral-default'],
          subtitle: ['typography-body-md', 'text-neutral-soft'],
          contentBlock: ['justify-center', 'items-center'],
          actions: ['w-fit', 'min-w-max', 'shrink-0', 'justify-center', 'items-end'],
        }}
        actionsSlot={
          <Button
            appearance="primary"
            size="medium"
            onClick={() => setAddUserOpen(true)}
            customClasses={{ container: ['w-fit', 'whitespace-nowrap'] }}
          >
            Add user
          </Button>
        }
      />

      <Card
        appearance="neutral"
        size="medium"
        customClasses={{
          container: ['border', 'border-neutral-soft'],
        }}
      >
        <Table
          ariaLabel="Users"
          size="default"
          striped
          headSlot={tableHeadSlot}
          customClasses={{
            headSlot: ['flex', 'flex-col', 'gap-2', 'p-4'],
          }}
        >
          <TableHead>
            <TableRow>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Apps</TableHeadCell>
              <TableHeadCell>Account access</TableHeadCell>
              <TableHeadCell>Last active</TableHeadCell>
              <TableHeadCell align="end">Enabled</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} rowKey={row.id}>
                <TableCell>
                  <UserItem
                    userName={row.name}
                    size="small"
                    customClasses={{
                      content: ['typography-body-xs', 'text-neutral-default'],
                    }}
                  >
                    {row.subtitle}
                  </UserItem>
                </TableCell>
                <TableCell customClasses={{ cell: ['typography-body-sm', 'text-neutral-default'] }}>
                  {row.apps}
                </TableCell>
                <TableCell customClasses={{ cell: ['typography-body-sm', 'text-neutral-default'] }}>
                  {row.accountAccess}
                </TableCell>
                <TableCell customClasses={{ cell: ['typography-body-sm', 'text-neutral-default'] }}>
                  {row.lastActive}
                </TableCell>
                <TableCell align="end">
                  <Switch
                    size="medium"
                    checked={enabledById[row.id]}
                    onChange={(checked) =>
                      setEnabledById((prev) => ({ ...prev, [row.id]: checked }))
                    }
                    customClasses={{ label: ['sr-only'] }}
                  >
                    {`Enabled for ${row.name}`}
                  </Switch>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </CardStack>
  )
}
