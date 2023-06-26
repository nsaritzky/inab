import { For } from "solid-js"
import { state, setState, envelopeBalances } from "../store"

export const Budget = () => (
  <div class="ml-64">
    <div class="mt-4 ml-4">
      <table class="table-fixed w-full">
        <thead>
          <tr class="text-left">
            <th>Category</th>
            <th>Assigned</th>
            <th>Activity</th>
            <th>Available</th>
          </tr>
        </thead>
        <tbody>
          <For each={Object.entries(state.envelopes)}>
            {([nm, envlp]) => (
              <tr>
                <td>{nm}</td>
                <td>
                  {envlp.allocated.toLocaleString("en-us", {
                    style: "currency",
                    currency: "USD",
                  })}
                </td>
                <td>
                  {envelopeBalances()[nm].toLocaleString("en-us", {
                    style: "currency",
                    currency: "USD",
                  })}
                </td>
                <td>
                  {(envlp.allocated + envelopeBalances()[nm]).toLocaleString(
                    "en-us",
                    {
                      style: "currency",
                      currency: "USD",
                    }
                  )}
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  </div>
)
