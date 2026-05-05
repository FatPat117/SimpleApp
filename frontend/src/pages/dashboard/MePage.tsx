import { DashboardSectionCard } from "../../components/shared/DashboardSectionCard";
import { FormTextInput } from "../../components/shared/FormTextInput";
import { SubmitButton } from "../../components/shared/SubmitButton";
import { useMePage } from "../../hooks/useMePage";

export function MePage() {
  const { isPending, submit, form } = useMePage();
  const { username, email, setUsername, setEmail } = form;

  return (
    <form onSubmit={submit}>
      <DashboardSectionCard
        title="My profile"
        subtitle="Update your account information."
        actions={<SubmitButton className="btn-primary" label="Save changes" pending={isPending} pendingLabel="Saving..." />}
      >
        <div className="space-y-3">
          <FormTextInput
            id="me-username"
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            errorClassName=""
          />
          <FormTextInput
            id="me-email"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            type="email"
            errorClassName=""
          />
        </div>
      </DashboardSectionCard>
    </form>
  );
}
