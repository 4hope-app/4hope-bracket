'use client'

import { useMemo, useState } from 'react'
import {
  Check,
  Crown,
  LogOut,
  Pencil,
  Plus,
  Link as LinkIcon,
  LogOutIcon,
  Search,
  Shield,
  UserX,
  Users,
} from 'lucide-react'
import { Avatar, Button, Card, Dialog, Divider, FormField, IconButton, Tabs, Tag, Tooltip, ValidatedInput } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
import { CropDialog, useImageCropFlow } from '@/components/ImageCropFlow'
import { MyLobbiesCard } from '@/components/MyLobbiesCard'
import { postJson, requestJson } from '@/lib/api'
import { useLang, useT } from '@/components/LangProvider'
import { format, localizePath } from '@/i18n/utils'
import { getHomeUrl, getLogoutUrl } from '@/lib/siteUrl'
import { defaultTeamCode, isValidTeamCode, normalizeTeamName } from '@/lib/team'

interface TeamMember {
  id: string
  displayName: string
  photoURL: string | null
  isManager: boolean
}

interface ProfileAppProps {
  displayName: string
  email: string
  photoURL?: string | null
  isTeamManager?: boolean
  teamName?: string | null
  teamCode?: string | null
  teamLogoURL?: string | null
  members?: TeamMember[]
  currentUserId?: string
}

function ProfileHeader({
  tab,
  setTab,
  displayName,
  email,
  photoURL,
  teamName,
  teamCode,
  onSignOut,
}: {
  tab: string
  setTab: (t: string) => void
  displayName: string
  email: string
  photoURL?: string | null
  teamName: string | null
  teamCode: string | null
  onSignOut: () => void
}) {
  const lang = useLang()
  const d = useT().profile
  return (
    <div className="relative bg-ink-1000">
      <div className="relative h-24 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(-32deg, transparent 0 110px, var(--color-gold-500) 110px 132px)',
            opacity: 0.4,
            maskImage: 'linear-gradient(90deg, transparent 80%, black 92%)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 80%, black 92%)',
          }}
        />
      </div>
      <div className="-mt-11 flex items-end gap-5 px-4">
        <Avatar
          src={photoURL}
          name={displayName}
          size="xl"
          className="rounded-[18px] shadow-[0_0_0_2px_rgba(255,255,255,0.18),0_0_0_4px_var(--color-ink-1000)]"
        />
        <div className="min-w-0 flex-1 pb-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            {teamCode ? (
              <Tag scheme="brand" size="sm" className="italic">
                {teamCode}
              </Tag>
            ) : null}
            <span className="font-display text-2xl font-extrabold tracking-[-0.01em] text-white">{displayName}</span>
            {!teamName ? (
              <Tag scheme="neutral" size="sm">
                {d.noTeam}
              </Tag>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] text-white/60">{email}</p>
        </div>
        <Tooltip label={d.signOut}>
          <IconButton
            icon={<LogOut size={18} />}
            variant="subtle"
            aria-label={d.signOut}
            className="mb-3.5 hidden text-white sm:inline-flex"
            onClick={onSignOut}
          />
        </Tooltip>
      </div>
      <div className="px-4 pt-5">
        <Tabs
          tabs={['Overview', 'Squad', 'Settings']}
          labels={{ Overview: d.tabs.overview, Squad: d.tabs.squad, Settings: d.tabs.settings }}
          // Account settings live on the home site: this tab opens that page instead of switching.
          hrefs={{ Settings: `${getHomeUrl()}${localizePath('/profile', lang)}` }}
          value={tab}
          onChange={setTab}
        />
      </div>
    </div>
  )
}

function EmptyRow({ icon, title, hint }: { icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-9 text-center">
      {icon}
      <span className="text-sm font-semibold text-white">{title}</span>
      <span className="max-w-80 text-[13px] text-white/60">{hint}</span>
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="flex max-w-[640px] flex-col gap-5">
      <MyLobbiesCard />
    </div>
  )
}

function SquadTab({
  isTeamManager,
  teamName,
  teamCode,
  teamLogoURL,
  members,
  currentUserId,
  onTeamSaved,
  onLeftTeam,
  onMemberKicked,
  onMemberPromoted,
}: {
  isTeamManager: boolean
  teamName: string | null
  teamCode: string | null
  teamLogoURL: string | null
  members: TeamMember[]
  currentUserId: string
  onTeamSaved: (name: string, code: string, logoURL: string | null) => void
  onLeftTeam: () => void
  onMemberKicked: (memberId: string) => void
  onMemberPromoted: (memberId: string) => void
}) {
  const d = useT().profile
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const hasTeam = Boolean(teamName)

  return (
    <div className="flex max-w-[640px] flex-col gap-5">
      <Card tone="arena" className="p-6">
        <div className="mb-1 flex items-center justify-between gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-white/50">{d.team}</span>
          {!hasTeam ? (
            <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={() => setTeamDialogOpen(true)}>
              {d.createTeam}
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              {isTeamManager ? (
                <>
                  <Tooltip label={d.editTeam}>
                    <IconButton
                      icon={<Pencil size={16} />}
                      variant="subtle"
                      aria-label={d.editTeam}
                      className="text-white"
                      onClick={() => setTeamDialogOpen(true)}
                    />
                  </Tooltip>
                  <InviteRosterButton />
                </>
              ) : null}
              <Tooltip label={d.leaveTeam}>
                <IconButton
                  icon={<LogOutIcon size={16} />}
                  variant="subtle"
                  aria-label={d.leaveTeam}
                  className="text-white"
                  onClick={() => setLeaveOpen(true)}
                />
              </Tooltip>
            </div>
          )}
        </div>
        <Divider className="mt-3" />
        {hasTeam ? (
          <div className="flex items-center gap-4 px-1 py-5">
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-ink-700 overflow-hidden">
              {teamLogoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={teamLogoURL} alt="" className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/brand/clover-mark.png" alt="" className="h-8 w-8 opacity-85" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-extrabold uppercase text-white">{teamName}</span>
                {isTeamManager ? (
                  <Tag scheme="brand" size="sm">
                    {d.manager}
                  </Tag>
                ) : null}
              </div>
              <p className="mt-1 text-[13px] text-white/60">
                {isTeamManager ? d.managerNote : d.memberNote}
              </p>
            </div>
          </div>
        ) : (
          <EmptyRow
            icon={<Shield size={26} className="text-white/50" />}
            title={d.notOnRoster}
            hint={d.notOnRosterHint}
          />
        )}
      </Card>

      <MembersCard
        hasTeam={hasTeam}
        members={members}
        isTeamManager={isTeamManager}
        currentUserId={currentUserId}
        onMemberKicked={onMemberKicked}
        onMemberPromoted={onMemberPromoted}
      />

      <TeamDialog
        open={teamDialogOpen}
        onClose={() => setTeamDialogOpen(false)}
        onSaved={onTeamSaved}
        initial={hasTeam ? { name: teamName!, code: teamCode ?? '', logoURL: teamLogoURL } : null}
      />

      <LeaveTeamDialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        isTeamManager={isTeamManager}
        members={members}
        currentUserId={currentUserId}
        onLeft={() => {
          setLeaveOpen(false)
          onLeftTeam()
        }}
      />
    </div>
  )
}

function MembersCard({
  hasTeam,
  members,
  isTeamManager,
  currentUserId,
  onMemberKicked,
  onMemberPromoted,
}: {
  hasTeam: boolean
  members: TeamMember[]
  isTeamManager: boolean
  currentUserId: string
  onMemberKicked: (memberId: string) => void
  onMemberPromoted: (memberId: string) => void
}) {
  const d = useT().profile
  const [query, setQuery] = useState('')
  const [promoteTarget, setPromoteTarget] = useState<TeamMember | null>(null)

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.isManager !== b.isManager) return a.isManager ? -1 : 1
      return a.displayName.localeCompare(b.displayName)
    })
  }, [members])

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sortedMembers
    return sortedMembers.filter((m) => m.displayName.toLowerCase().includes(q))
  }, [sortedMembers, query])

  return (
    <Card tone="arena" className="p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-white/50">{d.roster}</span>
        {hasTeam && members.length > 1 ? (
          <div className="relative w-40 shrink-0 sm:w-52">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={d.searchMembers}
              className="h-8 w-full rounded-[8px] border border-white/10 bg-ink-900 pl-8 pr-2.5 text-xs text-white placeholder:text-white/40 focus:border-gold-500/60 focus:outline-none"
            />
          </div>
        ) : null}
      </div>
      <Divider className="mt-3" />
      {hasTeam && filteredMembers.length > 0 ? (
        <div className="flex flex-col gap-1 py-1">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`flex items-center gap-3.5 rounded-[10px] border px-3 py-4.5 ${
                member.id === currentUserId ? 'border-gold-500/40 bg-gold-500/5' : 'border-transparent'
              }`}
            >
              <Avatar src={member.photoURL} name={member.displayName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">{member.displayName}</div>
                <div className="text-[13px] text-white/60">{member.isManager ? d.manager : d.member}</div>
              </div>
              {isTeamManager && member.id !== currentUserId ? (
                <div className="flex items-center gap-1">
                  <Tooltip label={d.makeManager}>
                    <IconButton
                      icon={<Crown size={16} />}
                      variant="subtle"
                      aria-label={format(d.makeManagerFor, { name: member.displayName })}
                      className="text-white/60 hover:text-gold-500"
                      onClick={() => setPromoteTarget(member)}
                    />
                  </Tooltip>
                  <Tooltip label={d.removeFromTeam}>
                    <IconButton
                      icon={<UserX size={16} />}
                      variant="subtle"
                      aria-label={format(d.removeMember, { name: member.displayName })}
                      className="text-white/60 hover:text-red-400"
                      onClick={() => onMemberKicked(member.id)}
                    />
                  </Tooltip>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : hasTeam && members.length > 0 ? (
        <EmptyRow icon={<Search size={26} className="text-white/50" />} title={d.noMatches} hint={d.noMatchesHint} />
      ) : (
        <EmptyRow icon={<Users size={26} className="text-white/50" />} title={d.noMembers} hint={d.noMembersHint} />
      )}

      <Dialog
        open={Boolean(promoteTarget)}
        title={d.promoteTitle}
        onClose={() => setPromoteTarget(null)}
        actions={
          <>
            <Button variant="subtle" className="text-white" onClick={() => setPromoteTarget(null)}>
              {d.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (promoteTarget) onMemberPromoted(promoteTarget.id)
                setPromoteTarget(null)
              }}
            >
              {d.makeManager}
            </Button>
          </>
        }
      >
        <strong className="text-white">{promoteTarget?.displayName}</strong>{' '}
        {d.promoteBody}
      </Dialog>
    </Card>
  )
}

function LeaveTeamDialog({
  open,
  onClose,
  isTeamManager,
  members,
  currentUserId,
  onLeft,
}: {
  open: boolean
  onClose: () => void
  isTeamManager: boolean
  members: TeamMember[]
  currentUserId: string
  onLeft: () => void
}) {
  const d = useT().profile
  const { showToast } = useToast()
  const [newOwnerId, setNewOwnerId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const otherMembers = members.filter((m) => m.id !== currentUserId)
  const needsSuccessor = isTeamManager && otherMembers.length > 0

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setNewOwnerId(otherMembers[0]?.id ?? '')
      setError(null)
    }
  }

  const handleLeave = async () => {
    setSaving(true)
    setError(null)
    try {
      const data = await postJson<{ teamClosed: boolean; teamName: string }>(
        '/api/teams/leave',
        needsSuccessor ? { newOwnerId } : {},
        d.leave.failed,
      )
      showToast({
        type: 'positive',
        title: d.leave.left,
        message: data.teamClosed
          ? format(d.leave.closed, { team: data.teamName })
          : format(d.leave.leftMsg, { team: data.teamName }),
      })
      onLeft()
    } catch (err) {
      setError(err instanceof Error ? err.message : d.leave.failed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      title={d.leave.title}
      onClose={saving ? undefined : onClose}
      actions={
        <>
          <Button variant="subtle" className="text-white" disabled={saving} onClick={onClose}>
            {d.cancel}
          </Button>
          <Button variant="primary" disabled={saving || (needsSuccessor && !newOwnerId)} onClick={handleLeave}>
            {saving ? d.leave.leaving : d.leaveTeam}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {needsSuccessor ? (
          <>
            <p className="text-sm text-white/70">
              {d.leave.pickSuccessor}
            </p>
            <div className="flex flex-col gap-2">
              {otherMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-white/10 px-3 py-2.5 hover:border-gold-500/50"
                >
                  <input
                    type="radio"
                    name="new-owner"
                    checked={newOwnerId === member.id}
                    onChange={() => setNewOwnerId(member.id)}
                  />
                  <Avatar src={member.photoURL} name={member.displayName} size="sm" />
                  <span className="text-sm text-white">{member.displayName}</span>
                </label>
              ))}
            </div>
          </>
        ) : isTeamManager ? (
          <p className="text-sm text-white/70">
            {d.leave.onlyOne}
          </p>
        ) : (
          <p className="text-sm text-white/70">{d.leave.memberNote}</p>
        )}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    </Dialog>
  )
}

type InviteState = 'idle' | 'loading' | 'copied' | 'error'

function InviteRosterButton() {
  const d = useT().profile
  const { showToast } = useToast()
  const [state, setState] = useState<InviteState>('idle')

  const handleInvite = async () => {
    if (state === 'loading') return
    setState('loading')
    try {
      const data = await postJson<{ inviteUrl: string }>('/api/teams/invite', undefined, d.invite.failed)

      await navigator.clipboard.writeText(data.inviteUrl)
      showToast({
        type: 'info',
        title: d.invite.toastTitle,
        message: d.invite.toastMsg,
      })
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch (err) {
      setState('error')
      showToast({
        type: 'danger',
        title: d.invite.errorTitle,
        message: err instanceof Error ? err.message : d.invite.tryAgain,
      })
      setTimeout(() => setState('idle'), 2000)
    }
  }

  return (
    <Tooltip label={state === 'copied' ? d.invite.copied : d.invite.invite}>
      <IconButton
        icon={state === 'copied' ? <Check size={16} className="text-gold-500" /> : <LinkIcon size={16} />}
        variant="subtle"
        aria-label={d.invite.invite}
        className="text-white"
        onClick={handleInvite}
        disabled={state === 'loading'}
      />
    </Tooltip>
  )
}

interface TeamDialogInitial {
  name: string
  code: string
  logoURL: string | null
}

function TeamDialog({
  open,
  onClose,
  onSaved,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSaved: (name: string, code: string, logoURL: string | null) => void
  initial: TeamDialogInitial | null
}) {
  const d = useT().profile
  const td = d.teamDialog
  const isEdit = Boolean(initial)
  const { showToast } = useToast()
  const [name, setName] = useState(initial?.name ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [codeFocused, setCodeFocused] = useState(false)
  const logo = useImageCropFlow(initial?.logoURL ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameCheck = normalizeTeamName(name)
  const nameValid = 'value' in nameCheck

  const suggestedCode = useMemo(() => (nameValid ? defaultTeamCode(nameCheck.value) : ''), [nameValid, nameCheck])
  // While the field is empty and not focused, display the auto-generated suggestion; typing or
  // focusing it shows exactly what the user entered, with no suggestion filled in behind their back.
  const effectiveCode = !code && !codeFocused ? suggestedCode : code
  const codeValid = /^[A-Z0-9]{2}$/.test(effectiveCode)
  const canSubmit = nameValid && codeValid && !saving

  const reset = () => {
    setName(initial?.name ?? '')
    setCode(initial?.code ?? '')
    setCodeFocused(false)
    logo.reset(initial?.logoURL ?? null)
    setError(null)
  }

  const handleClose = () => {
    if (saving) return
    reset()
    onClose()
  }

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) reset()
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    const finalName = nameValid ? nameCheck.value : name
    try {
      await requestJson('/api/teams', {
        method: isEdit ? 'PATCH' : 'POST',
        body: { name: finalName, code: effectiveCode, logoDataUrl: logo.image },
        fallbackError: isEdit ? td.failSave : td.failCreate,
      })
      onSaved(finalName, effectiveCode, logo.image)
      showToast({
        type: 'positive',
        title: isEdit ? td.updated : td.created,
        message: format(isEdit ? td.updatedMsg : td.createdMsg, { name: finalName }),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : isEdit ? td.failSave : td.failCreate)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      title={isEdit ? td.editTitle : td.createTitle}
      onClose={saving ? undefined : handleClose}
      closeOnBackdropClick={false}
      className="max-w-[500px]"
      actions={
        <>
          <Button variant="subtle" className="text-white" disabled={saving} onClick={handleClose}>
            {d.cancel}
          </Button>
          <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
            {saving ? (isEdit ? td.saving : td.creating) : isEdit ? td.save : td.create}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label={td.logoLabel} hint={td.logoHint}>
          {logo.image ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.image} alt="" className="h-16 w-16 rounded-[14px] object-cover" />
              <button
                type="button"
                onClick={() => logo.setCropOpen(true)}
                className="text-xs text-gold-500 underline-offset-2 hover:underline"
              >
                {td.editCrop}
              </button>
              <button
                type="button"
                onClick={() => logo.setImage(null)}
                className="text-xs text-white/50 underline-offset-2 hover:underline"
              >
                {td.remove}
              </button>
            </div>
          ) : (
            <label className="flex h-[100px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-white/20 bg-ink-900 text-sm text-white/60 hover:border-gold-500/60">
              <span>{td.upload}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => logo.handleFile(e.target.files?.[0])}
              />
            </label>
          )}
        </FormField>

        <ValidatedInput
          label={td.nameLabel}
          value={name}
          onChange={setName}
          validate={(v) => {
            const check = normalizeTeamName(v)
            return 'error' in check ? check.error : null
          }}
          hint={td.nameHint}
          placeholder={td.namePlaceholder}
        />

        <ValidatedInput
          label={td.codeLabel}
          value={effectiveCode}
          onChange={setCode}
          onFocus={() => setCodeFocused(true)}
          onBlur={() => setCodeFocused(false)}
          transform={(v) => v.toUpperCase()}
          validate={(v) => (!code || isValidTeamCode(v) ? null : td.codeError)}
          hint={td.codeHint}
          placeholder="AB"
        />

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>

      <CropDialog
        open={logo.cropOpen}
        src={logo.rawImage ?? logo.image}
        pendingCrop={logo.pendingCrop}
        onChange={logo.setPendingCrop}
        onCancel={logo.handleCropCancel}
        onDone={logo.handleCropDone}
      />
    </Dialog>
  )
}

export function ProfileApp({
  displayName,
  email,
  photoURL,
  isTeamManager = false,
  teamName = null,
  teamCode = null,
  teamLogoURL = null,
  members = [],
  currentUserId = '',
}: ProfileAppProps) {
  const { showToast } = useToast()
  const [tab, setTab] = useState('Overview')
  const currentDisplayName = displayName
  const currentPhotoURL = photoURL ?? null
  const [currentIsTeamManager, setCurrentIsTeamManager] = useState(isTeamManager)
  const [currentTeamName, setCurrentTeamName] = useState(teamName)
  const [currentTeamCode, setCurrentTeamCode] = useState(teamCode)
  const [currentTeamLogoURL, setCurrentTeamLogoURL] = useState(teamLogoURL)
  const [currentMembers, setCurrentMembers] = useState(members)
  const lang = useLang()
  // Home owns the session: its /logout page signs out and returns to bracket's home page.
  const onSignOut = () => window.location.assign(getLogoutUrl(lang, window.location.origin))

  const handleTeamSaved = (name: string, code: string, logoURL: string | null) => {
    setCurrentTeamName(name)
    setCurrentTeamCode(code)
    setCurrentTeamLogoURL(logoURL)
    if (currentMembers.length === 0) {
      setCurrentMembers([{ id: currentUserId, displayName: currentDisplayName, photoURL: currentPhotoURL, isManager: true }])
      setCurrentIsTeamManager(true)
    }
  }

  const handleLeftTeam = () => {
    setCurrentTeamName(null)
    setCurrentTeamCode(null)
    setCurrentTeamLogoURL(null)
    setCurrentMembers([])
    setCurrentIsTeamManager(false)
  }

  const handleMemberKicked = async (memberId: string) => {
    try {
      await postJson('/api/teams/kick', { memberId }, 'Failed to remove member')
      setCurrentMembers((prev) => prev.filter((m) => m.id !== memberId))
      showToast({ type: 'positive', title: 'Member removed', message: 'They can request a new invite to rejoin.' })
    } catch (err) {
      showToast({
        type: 'danger',
        title: 'Could not remove member',
        message: err instanceof Error ? err.message : 'Please try again.',
      })
    }
  }

  const handleMemberPromoted = async (memberId: string) => {
    try {
      await postJson('/api/teams/promote', { memberId }, 'Failed to assign manager')
      setCurrentMembers((prev) => prev.map((m) => ({ ...m, isManager: m.id === memberId })))
      setCurrentIsTeamManager(false)
      showToast({ type: 'positive', title: 'Manager updated', message: 'They now manage this squad.' })
    } catch (err) {
      showToast({
        type: 'danger',
        title: 'Could not assign manager',
        message: err instanceof Error ? err.message : 'Please try again.',
      })
    }
  }

  return (
    <div className="min-h-screen bg-ink-1000">
      <div className="mx-auto w-full max-w-[672px]">
        <ProfileHeader
          tab={tab}
          setTab={setTab}
          displayName={currentDisplayName}
          email={email}
          photoURL={currentPhotoURL}
          teamName={currentTeamName}
          teamCode={currentTeamCode}
          onSignOut={onSignOut}
        />
        <div className="px-4 pb-16 pt-7">
          {tab === 'Overview' ? (
            <OverviewTab />
          ) : tab === 'Squad' ? (
            <SquadTab
              isTeamManager={currentIsTeamManager}
              teamName={currentTeamName}
              teamCode={currentTeamCode}
              teamLogoURL={currentTeamLogoURL}
              members={currentMembers}
              currentUserId={currentUserId}
              onTeamSaved={handleTeamSaved}
              onLeftTeam={handleLeftTeam}
              onMemberKicked={handleMemberKicked}
              onMemberPromoted={handleMemberPromoted}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
